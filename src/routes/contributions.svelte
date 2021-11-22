<script lang="ts">
	import { fly } from 'svelte/transition';
	import { startOfWeek, subDays } from 'date-fns';
	import gql from 'graphql-tag';

	import { mdiOpenInNew, mdiPlay } from '@mdi/js';

	import {
		AppBar,
		Button,
		Card,
		CircularProgress,
		Header,
		DateField,
		graphStore,
		Icon,
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

	let selectedDate: Date = null;

	const calendarQuery = graphStore({
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
					}
				}
			}
		`,
		config: {
			onDataChange(data) {
				return data.user.contributionsCollection.contributionCalendar;
			}
		}
	});

	const commitsQuery = graphStore({
		query: gql`
			query ($login: String!, $from: DateTime, $to: DateTime) {
				user(login: $login) {
					contributionsCollection(from: $from, to: $to) {
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
				return data.user.contributionsCollection.commitContributionsByRepository;
			}
		}
	});

	function fetchCalendar() {
		calendarQuery.fetch({
			variables: {
				login,
				from,
				to
			}
		});
	}

	function fetchCommits() {
		commitsQuery.fetch({
			variables: {
				login,
				from: selectedDate ?? from,
				to: selectedDate ?? to
			}
		});
	}

	function fetchAll() {
		fetchCalendar();
		fetchCommits();
	}

	$: {
		selectedDate;
		fetchCommits();
	}

	fetchAll();
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
					fetchAll();
				}
			}}
		/>
		<DateField label="From" bind:value={from} dense picker />
		<DateField label="To" bind:value={to} dense picker />
		<Button
			on:click={() => fetchAll()}
			icon={mdiPlay}
			class="bg-blue-500 text-white hover:bg-blue-600"
		>
			Run
		</Button>
	</div>

	<div class="p-4">
		<div class="grid gap-4">
			<Card loading={$calendarQuery.loading} class="min-h-[232px]">
				<Header
					title={$calendarQuery.data?.totalContributions ?? '...'}
					subheading="Contributions"
					slot="header"
				>
					<div slot="actions">
						{#if selectedDate}
							<Button on:click={() => (selectedDate = null)}>Reset</Button>
						{/if}
					</div>
				</Header>

				<div class="grid grid-flow-col gap-1 justify-start px-4 pb-4">
					{#each $calendarQuery.data?.weeks ?? [] as week, i}
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
										class="w-4 h-4 rounded border border-black/10 transition-transform hover:scale-125 hover:opacity-100"
										class:opacity-10={selectedDate && selectedDate != day.date}
										style="grid-row: {day.weekday + 1}; background-color: {day.color}"
										on:click={() => (selectedDate = day.date)}
									/>
								</Tooltip>
							{/each}
						</div>
					{/each}
				</div>
			</Card>

			<div>
				<div class="text-xs text-black/50">Commits</div>

				<div class="relative min-h-[56px]">
					{#if $commitsQuery.loading}
						<Overlay center class="rounded">
							<CircularProgress />
						</Overlay>
					{/if}

					{#each $commitsQuery.data ?? [] as d}
						<ListItem subheading={d.contributions.totalCount} list="type">
							<a
								slot="title"
								href="https://github.com/{d.repository.nameWithOwner}/commits"
								target="_blank"
								class="hover:text-blue-500"
							>
								{d.repository.nameWithOwner}
								<Icon path={mdiOpenInNew} size=".8em" />
							</a>
						</ListItem>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
