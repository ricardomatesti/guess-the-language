import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
} from "react-simple-maps";

const geoUrl = "/countries_with_continents.json";

type geo = {
  geometry: any;
  id: string;
  properties: { name: string; continent: string };
  rsmKey: string;
  svgPath: string;
  type: string;
};
const MapChart = ({ continents }: { continents: String[] }) => {
  return (
    <ComposableMap
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147,
      }}
    >
      <Sphere
        id="map-sphere"
        fill="#E8F6FC"
        stroke="#E4E5E6"
        strokeWidth={0.5}
      />
      <Graticule stroke="#95D6F3" strokeWidth={0.5} />
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo: geo) => {
            const continent: string = geo.properties.continent;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={continents.includes(continent) ? "#4BB8EB" : "white"}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
};

export default MapChart;
