<script lang="ts">
	import { fly } from 'svelte/transition';
	import { startOfWeek, subDays } from 'date-fns';
	import gql from 'graphql-tag';

	import { mdiPlay } from '@mdi/js';

	import {
		AppBar,
		Button,
		Card,
		CircularProgress,
		DateField,
		graphStore,
		ListItem,
		Overlay,
		TextField,
		Tooltip
	} from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';

	import { user } from '$lib/stores';

	let login = $user.login;
	let from = startOfWeek(subDays(new Date(), 365));
	let to = new Date();

	const query = graphStore({
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
									contributionLevel
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

						startedAt
						endedAt
						hasAnyContributions
						hasActivityInThePast
						commitContributionsByRepository {
							repository {
								nameWithOwner
								description
							}
							contributions(first: 10) {
								totalCount
								nodes {
									commitCount
									occurredAt
								}
							}
							url
						}
					}
				}
			}
		`,
		config: {
			onDataChange(data) {
				return data.user.contributionsCollection;
			}
		}
	});

	function run() {
		query.fetch({
			variables: {
				login,
				from,
				to
			}
		});
	}
	run();

	$: console.log($query.data);
</script>

<AppBar title="Contributions" />

<main>
	<div class="flex gap-2 bg-white border-b p-4">
		<TextField
			label="User"
			bind:value={login}
			dense
			placeholder="User to lookup"
			shrinkLabel
			class="flex-1"
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					run();
				}
			}}
		/>
		<DateField label="From" bind:value={from} dense picker />
		<DateField label="To" bind:value={to} dense picker />
		<Button on:click={() => run()} icon={mdiPlay} class="bg-blue-500 text-white hover:bg-blue-600">
			Run
		</Button>
	</div>

	<div class="relative min-h-[56px] p-4">
		{#if $query.loading}
			<Overlay center class="rounded">
				<CircularProgress />
			</Overlay>
		{/if}

		{#if $query.data}
			<div class="grid gap-4">
				<Card
					title={$query.data.contributionCalendar.totalContributions}
					subheading="Contributions"
				>
					<div class="grid grid-flow-col gap-1 justify-start px-4 pb-4 overflow-auto">
						{#each $query.data.contributionCalendar.weeks as week, i}
							<div class="week grid grid-rows-[repeat(7,1fr)] gap-1">
								{#each week.contributionDays as day}
									<Tooltip offset={2}>
										<div
											slot="title"
											class="bg-black/90 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap"
											transition:fly={{ y: -6, duration: 300 }}
										>
											<strong>{day.contributionCount} contributions</strong>
											<div>on {formatDate(day.date, PeriodType.Day)}</div>
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

				<div>
					<div class="text-xs text-black/50">Commits</div>

					{#each $query.data.commitContributionsByRepository as d}
						<ListItem title={d.repository.nameWithOwner} subheading={d.contributions.totalCount} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</main>
