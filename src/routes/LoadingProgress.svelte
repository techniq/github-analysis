<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import { Progress, cls } from 'svelte-ux';

  export let loading = false;
  export let timeout = 5000;

  $: loading ? start() : finish();

  let isError = false;
  const progress = tweened(0, { duration: timeout, easing: cubicOut });

  async function start() {
    isError = false;
    progress.set(0, { duration: 0 }); // reset immediately

    await progress.set(1);

    // If promise resolves, finish was not called before timeout (duration)
    // TODO: Add callback?
    // console.log('Did not finish in time');
    isError = true;
  }

  function finish() {
    progress.set(1, { duration: 200, easing: cubicOut });
    isError = false;
  }
</script>

<Progress value={$progress} {...$$restProps} class={cls(isError && 'error', $$props.class)} />
