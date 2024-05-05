<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { extent } from "d3-array";
  import { scaleSqrt } from "d3-scale";

  import Legend from "./Legend.svelte";

  import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
  import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

  import data from "../data/data.json";

  let map;
  let geocoderContainer;
  let activeProp = "Prop A";

  let minRadius = 2;
  let maxRadius = 10;
  let normalizer = 1;

  let rScale = scaleSqrt().domain([0, 112530]).range([0, 20]);

  function calculateRadius(value) {
    let scaledValue = value * normalizer;
    return Math.max(minRadius, Math.min(maxRadius, scaledValue));
  }

  // Tooltip related variables
  let tooltip = null;
  let tooltipContent = "";

  let colors = ["#966139", "#61AA04"];

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  let padding = { top: 0, bottom: 0, left: 0, right: 0 };

  function prepareData(data, activeProp) {
    return data.map((row) => ({
      ...row,
      radius_generated: rScale(row.amount_of_biosolids_generated),
      radius_applied: rScale(row.amount_of_biosolids_managed_land_applied),
    }));
  }

  onMount(() => {
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/agwaterdesk/clvtpr8ms05ty01qlb9u95lj2/draft",
    });

    map.fitBounds([-127.001953, 24.335836, -67.060547, 49.92912], {
      duration: 0,
    });

    map.setMinZoom(map.getZoom());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      countries: "us",
      placeholder: "Zoom to location",
    });

    // geocoderContainer.appendChild(geocoder.onAdd());

    map.addControl(geocoder, "top-left");

    let preparedFeatures = prepareData(data, activeProp);

    map.on("load", () => {
      map.addSource("sites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: preparedFeatures.map((item) => ({
            type: "Feature",
            properties: {
              facility_name: item["facility_name"],
              city: item["city"],
              state: item["state"],
              radius_generated: item["radius_generated"],
              radius_applied: item["radius_applied"],
              amount_of_biosolids_generated:
                item["amount_of_biosolids_generated"],
              amount_of_biosolids_managed_land_applied:
                item["amount_of_biosolids_managed_land_applied"],
            },
            geometry: {
              type: "Point",
              coordinates: [item.longitude, item.latitude],
            },
          })),
        },
      });

      map.addLayer({
        id: "circle-layer",
        type: "circle",
        source: "sites",
        paint: {
          "circle-radius": [
            "get",
            activeProp == "Prop A" ? "radius_generated" : "radius_applied",
          ],
          "circle-color": activeProp == "Prop A" ? colors[0] : colors[1],
          "circle-opacity": 0.25,
          "circle-stroke-width": 1,
          "circle-stroke-color": activeProp == "Prop A" ? colors[0] : colors[1],
        },
      });

      // Initialize tooltip div
      tooltip = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
      });

      // Add mousemove event to show tooltip
      map.on("mousemove", "circle-layer", (e) => {
        if (e.features.length > 0) {
          map.getCanvas().style.cursor = "pointer";
          const feature = e.features[0];
          const props = feature.properties;

          // Set the style for the hovered feature
          map.setPaintProperty("circle-layer", "circle-stroke-width", [
            "case",
            ["==", ["get", "facility_name"], feature.properties.facility_name],
            2, // 2px stroke for the hovered feature
            1, // No stroke for others
          ]);

          map.setPaintProperty("circle-layer", "circle-stroke-color", [
            "case",
            ["==", ["get", "facility_name"], feature.properties.facility_name],
            "#000000",
            activeProp == "Prop A" ? colors[0] : colors[1],
          ]);

          tooltip
            .setLngLat(e.lngLat)
            .setHTML(
              `
            <strong>${props.facility_name}</strong><br/>
            <em>${props.city}, ${props.state}</em>  <br/>
          
            <p><b>Biosolids generated:</b> ${props.amount_of_biosolids_generated.toLocaleString()} dry tons</p>
            <p><b>Biosolids spread:</b> ${props.amount_of_biosolids_managed_land_applied.toLocaleString()} dry tons</p>

            `
            )
            .addTo(map);
        }
      });

      // Add mouseleave event to hide tooltip
      map.on("mouseleave", "circle-layer", () => {
        map.getCanvas().style.cursor = "";
        map.setPaintProperty('circle-layer', 'circle-stroke-width', 1); 
        map.setPaintProperty('circle-layer', 'circle-stroke-color',  activeProp == "Prop A" ? colors[0] : colors[1]); 
        tooltip.remove();
      });
    });

    geocoder.on("result", ({ result }) => {
      if (result.bbox) {
        map.fitBounds(result.bbox, {
          padding,
        });
      } else if (result.center) {
        map.flyTo({
          center: result.center,
          zoom: 10,
          essential: true,
        });
      }
    });
  });
  ["get", "radius"];
  function updateMap() {
    map.setPaintProperty("circle-layer", "circle-radius", [
      "get",
      activeProp == "Prop A" ? "radius_generated" : "radius_applied",
    ]);
    map.setPaintProperty(
      "circle-layer",
      "circle-color",
      activeProp == "Prop A" ? colors[0] : colors[1]
    );

    map.setPaintProperty(
      "circle-layer",
      "circle-stroke-color",
      activeProp == "Prop A" ? colors[0] : colors[1]
    );
  }

  function changeProp(prop) {
    activeProp = prop;
    updateMap();
  }
</script>

<div>
  <div class="controls">
    <Legend {rScale} />

    <div class="toggle">
      <span class="dek">Size waste water treatment centers by</span>
      <div class="buttons">
        <button
          class:active={activeProp == "Prop A"}
          style:--color={colors[0]}
          on:click={() => changeProp("Prop A")}>Biosolids generated</button
        >
        <button
          class:active={activeProp == "Prop B"}
          style:--color={colors[1]}
          on:click={() => changeProp("Prop B")}>Biosolids spread</button
        >
      </div>
    </div>
  </div>

  <!-- <div bind:this={geocoderContainer} class="geocoder" /> -->

  <div id="map"></div>
</div>

<style lang="scss">
  #map {
    width: 100%;
    height: 700px;
  }

  .controls {
    display: flex;
    align-items: start;
    gap: 2rem;
    margin-bottom: 1rem;

    .toggle {
    }
  }

  button {
    background: transparent;
    border: 2px solid transparent;
    position: relative;
    padding: 3px 6px;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      &::before {
        opacity: 0.5;
      }
    }

    &.active {
      border: 2px solid;
      &::before {
        opacity: 0.5;
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--color);
      opacity: 0.3;
      z-index: -1;
    }
  }

  :global {
    .mapboxgl-ctrl-geocoder {
      box-shadow: none;
      border: 1px solid #666;

      .mapboxgl-ctrl-geocoder--input {
        font-family: var(--font-sans);
      }
    }

    .mapboxgl-popup .mapboxgl-popup-content {
      filter: drop-shadow(2px 2px 4px #00000050);
      font: var(--font-sans);
    }
  }
</style>
