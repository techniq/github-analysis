<script lang="ts">
	import { fly } from 'svelte/transition';
	import { startOfWeek, subDays } from 'date-fns';

	import gql from 'graphql-tag';
	import {
		AppBar,
		Card,
		CircularProgress,
		DateField,
		graphStore,
		Overlay,
		TextField,
		Tooltip
	} from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';

	let login = 'techniq';
	let from = startOfWeek(subDays(new Date(), 365));
	let to = new Date();

	const query = graphStore();
	$: query.fetch({
		query: gql`
			query ($login: String!, $from: DateTime, $to: DateTime) {
				user(login: $login) {
					contributionsCollection(from: $from, to: $to) {
						contributionCalendar {
							totalContributions
							weeks {
								firstDay
								contributionDays {
									weekday
									date
									contributionCount
									color
								}
							}
							months {
								name
								year
								firstDay
								totalWeeks
							}
						}
					}
				}
			}
		`,
		variables: {
			login,
			from,
			to
		}
	});
</script>

<AppBar title="Contributions" />

<main>
	<div class="flex gap-2 bg-white border-b p-4">
		<TextField label="Login" bind:value={login} dense placeholder="User to lookup" shrinkLabel />
		<DateField label="From" bind:value={from} dense picker />
		<DateField label="To" bind:value={to} dense picker />
	</div>

	<div class="relative min-h-[56px] p-4">
		{#if $query.loading}
			<Overlay center class="rounded">
				<CircularProgress />
			</Overlay>
		{/if}

		{#if $query.data}
			<Card
				title={$query.data.user.contributionsCollection.contributionCalendar.totalContributions}
				subheading="Contributions"
			>
				<div class="grid grid-flow-col gap-1 justify-start px-4 pb-4 overflow-auto">
					{#each $query.data.user.contributionsCollection.contributionCalendar.weeks as week, i}
						<div class="week grid grid-rows-[repeat(7,1fr)] gap-1">
							{#each week.contributionDays as day}
								<Tooltip offset={2}>
									<div
										slot="title"
										class="bg-black/90 text-white text-xs p-2 rounded pointer-events-none"
										transition:fly={{ y: -6, duration: 300 }}
									>
										<strong>{day.contributionCount} contributions</strong> on {formatDate(
											day.date,
											PeriodType.Day
										)}
									</div>
									<div
										class="w-4 h-4 rounded border border-black/10"
										style="grid-row: {day.weekday + 1}; background-color: {day.color}"
									/>
								</Tooltip>
							{/each}
						</div>
					{/each}
				</div>
			</Card>
		{/if}
	</div>
</main>
