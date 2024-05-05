<script>
  import Window from "./components/Window.svelte";
  import Map from "./components/Map.svelte";

  // Handle responsive iframes for embeds
  import pym from "pym.js";

  new pym.Child({
    polling: 500,
  });
</script>

<Window />
<!-- Outer div must have class 'chart-container' don't change -->
<div class="chart-container">
  <h1 class="headline">
    Mapping sewage sludge generation and land application at wastewater
    treatment facilities in 2023
  </h1>
  <p class="dek">
    The EPA's ECHO database tracks the generation and land application of
    biosolids at wastewater treatment facilities. Often referred to as sewage
    sludge, biosolids are spread on agricultural fields as fertilizer and poses
    environmental risks, including PFAS contamination.
  </p>
  <p class="sr-only">[altText]</p>

  <Map />
</div>

<style lang="scss">
  .chart-container {
    max-width: 800px;
    width: 100%;
    padding: 1rem;
  }
</style>
