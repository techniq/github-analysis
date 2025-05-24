class AppState {
  user = $state<{ login: string; name: string; avatarUrl: string }>();
}

export const appState = new AppState();
