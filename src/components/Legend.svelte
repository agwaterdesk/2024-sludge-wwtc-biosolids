<script>
  export let rScale;

  const legendValues = [
    { label: "1k", value: 1000 },
    { label: "10k", value: 10000 },
    { label: "100k", value: 100000 },
  ];
</script>

<div class="legend">
  <span class="dek">Measured in dry tons</span>
  <div class="items">
    {#each legendValues as { label, value }}
      <div class="legend-item">
        <svg width="40" height="40">
          <circle cx="20" cy="20" r={rScale(value)} fill="grey" />
        </svg>
        <span>{label}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .legend {
   
  }

  .items {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .legend-item {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .legend-item span {
    margin-top: 4px;
    font-size: 12px;
    color: #333;
  }
</style>
