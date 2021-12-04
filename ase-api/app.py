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

    return results


def format_all_prices(postcodes, price_data):
    res = {}

    curr_pos_code = ''

    last_pos_code = ''

    for p in price_data["results"]["bindings"]:
        curr_pos_code = p["postcode"]["value"]
        if curr_pos_code != last_pos_code:
            price = []
        last_pos_code = curr_pos_code
        price.append(int(p["amount"]["value"]))
        res[p["postcode"]["value"]] = {
            "lat": 0, "long": 0, "avg_price": sum(price) / len(price)}

    for r in postcodes.json()['result']:
        if r['postcode'] in res.keys():
            print(r['postcode'])
            res[r['postcode']]['lat'] = r["latitude"]
            res[r['postcode']]['long'] = r["longitude"]

    return res


def get_postcodes(position):
    postcodes = requests.get(
        "https://api.postcodes.io/postcodes?lon={}&lat={}&limit=99&radius=2000".format(position['long'], position['lat']))
    pc_list = []
    for i in postcodes.json()['result']:
        pc_list.append(i['postcode'])
    return {"list": pc_list, "data": postcodes}


@api.route('/', methods=['GET', 'POST'])
class test(Resource):

    @api.doc(parser=parser)
    def post(self):
        position = request.json
        postcodes = get_postcodes(position)
        price_data = get_prices(postcodes["list"])
        return format_all_prices(postcodes["data"], price_data)


@api.route('/pricesByYear', methods=['GET', 'POST'])
class test(Resource):

    @api.doc(parser=parser)
    def post(self):
        position = request.json
        postcodes = get_postcodes(position)
        price_data = get_prices(postcodes["list"])
        return format_prices_by_year(postcodes["data"], price_data)

        # return res


if __name__ == '__main__':
    app.run()
