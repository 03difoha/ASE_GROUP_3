from flask import Flask, request, jsonify, render_template
from flask_restplus import Api, Resource, reqparse
from SPARQLWrapper import SPARQLWrapper, JSON
import requests

app = Flask(__name__)
api = Api(app)
parser = reqparse.RequestParser()
parser.add_argument('name', help='Specify your name')

HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT',
                'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']


def get_prices(postcodes):
    print(postcodes)
    pc = ['BN1 1FN', 'BN2 1RA', 'BN2 1RY', 'BN2 1RD', 'BN1 1FZ']
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

       OPTIONAL {?addr lrcommon:county ?county}
       OPTIONAL {?addr lrcommon:paon ?paon}
       OPTIONAL {?addr lrcommon:saon ?saon}
       OPTIONAL {?addr lrcommon:street ?street}
       OPTIONAL {?addr lrcommon:town ?town}
      }
      ORDER BY ?amount
      """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    # res = [result["amount"]["value"] + " | " + result["postcode"]["value"] +
    #        " | " + result["street"]["value"] for result in results["results"]["bindings"]]
    return results


@api.route('/', methods=['GET', 'POST'])
class test(Resource):

    @api.doc(parser=parser)
    def post(self):
        data = request.json
        res = requests.get(
            "https://api.postcodes.io/postcodes?lon={}&lat={}&limit=99&radius=2000".format(data['long'], data['lat']))
        # res = jsonify(res)
        pc_list = []
        # print(res)
        # print(res.json())
        for i in res.json()['result']:
            pc_list.append(i['postcode'])
        return(get_prices(pc_list))


if __name__ == '__main__':
    app.run()
