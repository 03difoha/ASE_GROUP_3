from flask import Flask, request, jsonify, render_template
from flask_restplus import Api, Resource, reqparse
from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import json

app = Flask(__name__)
api = Api(app)
parser = reqparse.RequestParser()
parser.add_argument('name', help='Specify your name')

HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT',
                'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']


def get_prices(postcodes):
    # print(postcodes)
    sparql = SPARQLWrapper(
        "http://landregistry.data.gov.uk/landregistry/query")
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
    res = {}

    curr_pos_code = ''

    last_pos_code = ''

    for result in results["results"]["bindings"]:
        curr_pos_code = result["postcode"]["value"]

        if curr_pos_code != last_pos_code:
            price = []
        last_pos_code = curr_pos_code
        price.append(int(result["amount"]["value"]))
        res[result["postcode"]["value"]] = {
            "lat": 0, "long": 0, "avg_price": sum(price) / len(price)}

    # print(res)
    return res
    # max_price = max(res.values())

    # return {key: (value / max_price) for key, value in res.items()}


@api.route('/', methods=['GET', 'POST'])
class test(Resource):

    @api.doc(parser=parser)
    def post(self):
        data = request.json
        res = requests.get(
            "https://api.postcodes.io/postcodes?lon={}&lat={}&limit=99&radius=2000".format(data['long'], data['lat']))
        pc_list = []
        for i in res.json()['result']:
            pc_list.append(i['postcode'])
        price_data = get_prices(pc_list)
        print(price_data)
        for r in res.json()['result']:
            if r['postcode'] in price_data.keys():
                print(r['postcode'])
                price_data[r['postcode']]['lat'] = r["latitude"]
                price_data[r['postcode']]['long'] = r["longitude"]
        return price_data


if __name__ == '__main__':
    app.run()
