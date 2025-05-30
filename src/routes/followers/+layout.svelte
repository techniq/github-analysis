<script lang="ts">
  import { mdiAccount, mdiPlay } from '@mdi/js';

  import { Button, Card, TextField } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import { goto } from '$app/navigation';
  import { Area, Axis, Chart, Highlight, LinearGradient, Svg, Tooltip } from 'layerchart';
  import { scaleTime } from 'd3-scale';

  let { data, children } = $props();

  let login = $derived(data.variables.login);

  function run() {
    const params = new URLSearchParams();
    params.set('login', login);
    goto(`?${params}`);
  }

  // Add running count for easier chart value
  let chartData = $derived(
    data.followers.map((d, i) => {
      return {
        ...d,
        count: i + 1
      };
    })
  );
</script>

<main>
  <form
    class="flex gap-2 bg-surface-100 border-b p-4"
    onsubmit={(e) => {
      e.preventDefault();
      run();
    }}
  >
    <TextField
      label="User"
      bind:value={login}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      class="grow"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card
      title={data.variables.login}
      subheading="{format(data.followers.length)} followers"
      class="h-[300px]"
    >
      <div
        class="h-full grid place-items-center m-3 bg-surface-200/50 text-surface-content/30 rounded-lg border"
      >
        TODO: Determine way to find follow date to allow visualization
      </div>
      <!-- <Chart
        data={chartData}
        x="id"
        xScale={scaleTime()}
        y="count"
        yDomain={[0, null]}
        yNice
        padding={{ left: 36, bottom: 32, right: 24 }}
        tooltip={{ mode: 'bisect-x' }}
      >
        <Svg>
          <Axis placement="left" grid rule format="metric" />
          <Axis placement="bottom" rule />
          <LinearGradient class="from-secondary/50 to-secondary/1" vertical let:gradient>
            <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={gradient} tweened />
          </LinearGradient>
          <Highlight points={{ class: 'fill-secondary' }} lines />
        </Svg>

        <Tooltip.Root let:data>
          <Tooltip.Header>{formatDate(data.starred_at, 'M/d/yyyy @ h:mm aa')}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="User" value={data.login} />
            <Tooltip.Item label="Count" value={data.count} />
          </Tooltip.List>
        </Tooltip.Root>
      </Chart> -->
    </Card>

    {@render children?.()}
  </div>
</main>
