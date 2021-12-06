from flask import Flask, request
from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import coordinatesToPostcodes as ctpc
import concurrent.futures

app = Flask(__name__)
pc_calc = ctpc.coordinatesToPostcodes()

def get_prices_async(postcodes, workers, chunk_size):
    #chunk_size = 400
    #Get successive n-sized chunks of postcodes
    pc_chunks = [postcodes[i:i + chunk_size] for i in range(0, len(postcodes), chunk_size)]
    price_data = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_chunk = {executor.submit(get_prices, chunk): chunk for chunk in pc_chunks}
        for future in concurrent.futures.as_completed(future_to_chunk):
            chunk = future_to_chunk[future]
            try:
                data = future.result()
                #print("thread finished")
                price_data.extend(data)
            except Exception as exc:
                print('%r generated an exception: %s' % (chunk, exc))
            
    return price_data


def get_prices(postcodes):  
    
    sparql = SPARQLWrapper("http://landregistry.data.gov.uk/landregistry/query")  
     
    sparql.setQuery("""
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix owl: <http://www.w3.org/2002/07/owl#>
        prefix xsd: <http://www.w3.org/2001/XMLSchema#>
        prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
        prefix ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
        prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
        prefix skos: <http://www.w3.org/2004/02/skos/core#>
        prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>
        SELECT ?paon ?saon ?street ?town ?county ?postcode ?amount ?date ?category
        WHERE
        {
        VALUES ?postcode {""" + '"{0}"'.format('" "'.join(postcodes)) + """}
        ?addr lrcommon:postcode ?postcode.
        ?transx lrppi:propertyAddress ?addr ;
                lrppi:pricePaid ?amount ;
                lrppi:transactionDate ?date ;
                lrppi:transactionCategory/skos:prefLabel ?category.
        }
        """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()       

    return results['results']['bindings']



def format_all_prices(postcodes, price_data):
    res = {}
    curr_pos_code = ''
    last_pos_code = ''
    for p in price_data:
        curr_pos_code = p["postcode"]["value"]
        if curr_pos_code != last_pos_code:
            price = []
        last_pos_code = curr_pos_code
        price.append(int(p["amount"]["value"]))
        res[p["postcode"]["value"]] = {
            "lat": 0, "long": 0, "avg_price": sum(price) / len(price)}

    #res = attach_long_lat_to_prices(postcodes.json()['result'], res)
    res = attach_long_lat_to_prices(postcodes, res)
    return res


def format_prices_by_year(postcodes, price_data):
    res = {}
    for p in price_data:
        if p["postcode"]["value"] not in res:
            # if no record of postcode in res, then create a new empty record
            res[p["postcode"]["value"]] = {"lat": 0, "long": 0, 'years': {}}
        
        # if a record for this postcode exists, but not for this year then create an array with the current sale value in
        if p['date']['value'][0:4] not in res[p["postcode"]["value"]]['years']:
            res[p["postcode"]["value"]]['years'][p['date']
                                                    ['value'][0:4]] = [int(p['amount']['value'])]
        else:
            # if we do have a record for this year already then append the current sale value onto the year array
            res[p["postcode"]["value"]]['years'][p['date']['value'][0:4]].append(
                int(p['amount']['value']))

    res = attach_long_lat_to_prices(postcodes, res)
    return res


def attach_long_lat_to_prices(postcodes, data):
    for r in postcodes.keys():
        if r in data.keys():
            data[r]['lat'] = postcodes[r]["latitude"]
            data[r]['long'] = postcodes[r]["longitude"]

    return data


# def get_postcodes(position):
#     postcodes = requests.get(
#         "https://api.postcodes.io/postcodes?lon={}&lat={}&limit=99&radius=2000".format(position['long'], position['lat']))
#     pc_list = []
#     for i in postcodes.json()['result']:
#         pc_list.append(i['postcode'])
#     return {"list": pc_list, "data": postcodes}  


@app.route('/',  methods=['GET', 'POST'])
def all_years_average():
    position = request.json
    postcodes = pc_calc.get_postcodes(position['lat'], position['long'], 5)
    price_data = get_prices_async(list(postcodes.keys()), 10, 150)
    return format_all_prices(postcodes, price_data)


@app.route('/pricesByYear', methods=['GET', 'POST'])
def prices_by_year():
    position = request.json
    postcodes = pc_calc.get_postcodes(position['lat'], position['long'], 5)
    price_data = get_prices(list(postcodes.keys()), 10, 150)
    return format_prices_by_year(postcodes, price_data)


if __name__ == '__main__':
    app.run()
