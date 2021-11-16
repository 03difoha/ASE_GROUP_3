from flask import Flask, request, jsonify, render_template
from flask_restplus import Api, Resource, reqparse
from SPARQLWrapper import SPARQLWrapper, JSON
app = Flask(__name__)
api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('name', help='Specify your name')


@api.route('/hello/')
class HelloWorld(Resource):

    @api.doc(parser=parser)
    def get(self):
        args = parser.parse_args()
        name = args['name']
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
       VALUES ?postcode {"BR5 1BY"^^xsd:string}
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
        # res=[]
        res = [result["amount"]["value"] + " | " + result["postcode"]["value"] +
               " | " + result["street"]["value"] for result in results["results"]["bindings"]]
        return res
        # if (name=="piyush"):
        # return res
        # else:
        # return "name not match"


if __name__ == '__main__':
    app.run()
