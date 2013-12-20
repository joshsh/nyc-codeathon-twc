
zipByCountyName = {}
for (var i = 0; i < counties.length; i++) {
    var e = counties[i];
    zipByCountyName[e.name] = e.zip;
}

function getValue(b) {
    return parseFloat(b.rate.value)/100.0;
}

function createMap(b) {

var bindings = b;

var po = org.polymaps;

// Compute noniles.
var quantile = pv.Scale.quantile()
    .quantiles(9)
    .domain(bindings, getValue)
    .range(0, 8);

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 43.096569, lon: -75.231887})
    .zoom(7)
    .zoomRange([3, 7])
    .add(po.interact());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/3063c13b49794da2ac9e9b394126bf24" // http://cloudmade.com/register
    + "/20760/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
    .on("load", load)
    .id("county"));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
    .id("state"));

map.add(po.compass()
    .pan("none"));


function load(e) {
  var el = document.getElementById("indicator-select");
  var selectedIndicator = el.options[el.selectedIndex].text;

  //alert("indicator = " + selectedIndicator);

  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    if (feature.data.id.substring(9) == "000") continue; // skip bogus counties

    for (var k = 0; k < bindings.length; k++)
    {
        var b = bindings[k];
        var indicator = b.indicator.value;

        if (indicator == selectedIndicator) {
            var countyName = b.county.value;

            var zip = zipByCountyName[countyName];

            if (null != zip) {
                if (zip == feature.data.id.substring(7))
                {
                    var p = getValue(b);
                    var label = (p * 100).toFixed(2) + "%";

                    feature.element.setAttribute("class", "q" + quantile(p) + "-" + 9);
                    feature.element.appendChild(po.svg("title").appendChild(
                        document.createTextNode(feature.data.properties.name + "\n" + label))
                        .parentNode);
                }
            }
    	}
    }
  }
}

map.container().setAttribute("class", "Blues");
}

function getDataAndVisualize() {
    $.get( "http://logd.tw.rpi.edu/sparql.php?query-option=text&query=PREFIX+ny%3A+%3Chttp%3A%2F%2Flogd.tw.rpi.edu%2Fsource%2Fhealth-data-ny-gov%2Fdataset%2FCommunity-Health-Obesity-and-Diabetes-Related-Indi%2Fvocab%2Fenhancement%2F1%2F%3E%0D%0ASELECT+%3Findicator+%3Frate+%3Fcounty+WHERE+%7B%0D%0A++++%3Fs+ny%3Acounty_name+%3Fcounty+.%0D%0A++++%3Fs+ny%3Aindicator+%3Findicator+.%0D%0A++++%3Fs+ny%3Apercentage_rate+%3Frate+.%0D%0A++++FILTER%28regex%28%3Findicator%2C+%27percentage%27%2C+%27i%27%29%29%0D%0A%7D+ORDER+BY+%3Fcounty&service-uri=http%3A%2F%2Flogd.tw.rpi.edu%2Fsparql&output=sparqljson&callback=&tqx=&tp=",
           function( data ) {
        //alert( "success" );
        var results = data.results;
        var bindings = results.bindings
        //alert("#results = " + bindings.length);
        createMap(bindings);
    })
    .done(function() {
        //alert( "second success" );
    })
    .fail(function() {
        alert( "error" );
    })
    .always(function() {
        //alert( "finished" );
    });
}