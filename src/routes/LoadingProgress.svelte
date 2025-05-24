<script>
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  import { Progress } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  let { loading = false, timeout = 5000, class: className, ...props } = $props();

  $effect(() => {
    loading ? start() : finish();
  });

  let isError = $state(false);
  let progress = new Tween(0, { duration: timeout, easing: cubicOut });

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

<Progress value={progress.current} {...props} class={cls(isError && 'error', className)} />
