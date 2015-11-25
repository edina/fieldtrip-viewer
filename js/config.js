/** Global configuration options */
// NOTE: we can encapsulate that only *after* we start requiring invariants for these variables

/* Pulbic USER 
* @param {string} PUBLIC_UUID
*/
PUBLIC_UUID = "2338e388-f34e-25d9-945c-54cffd9c46c2";

/* Is this a PCAPI geojson or a WFS geojson ? ( PCAPI is richer but cannot be handled by a WFS )
* @param endpoint_type - Can be PCAPI or WFS
*/
ENDPOINT_TYPE = "WFS";

/* Access a private or a public endpoint ? (Many SAML endpoint differ depending on openess)
* @param {bool} private_endpoint
*/
PRIVATE_SURVEY = false;

/* Whether we are testing using local file urls instead of endpoint or not -- this will change all endpoints to local files
* @param {bool} test
*/
TEST = true;

/* default values for endpoints -- Will return the right endpoint depednign on type (eg. WFS), test-ing or privacy settings
* @param {bool} private_endpoints
*/
ENDPOINTS = {
    "PCAPI" : {
                test_url: "data/Snowdonia National Park Japanese Knotweed Survey - poly.geojson?",
                private_base_url: 'https://dyfi.cobwebproject.eu/1.3/pcapi/records/local/00000000-0000-0000-0000-000000000000/?',
                public_base_url: 'https://dyfi.cobwebproject.eu/1.3/pcapi/records/local/' + PUBLIC_UUID + '/?',
                private_image_base: "https://dyfi.cobwebproject.eu/1.3/pcapi/records/local/00000000-0000-0000-0000-000000000000/",
                public_image_base: 'https://dyfi.cobwebproject.eu/1.3/pcapi/records/local/' + PUBLIC_UUID + '/'
            },
    "WFS" : {
                // constant url pointing to local file for unit testing
                test_url: "data/test_wfs.geojson?",
                private_base_url:'https://dyfi.cobwebproject.eu/geoserver/cobweb/wfs?',
                public_base_url:'https://dyfi.cobwebproject.eu/geoserver/public/wfs?'
            }
}
