<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the GATE board game React/Vite app. PostHog was initialized in `src/main.tsx` with `PostHogProvider` and `PostHogErrorBoundary` wrapping the full app, enabling automatic error capture and session replay. Nine game-specific events were instrumented in `src/GateComponents/Boards/GameBoard.tsx` at the event handler level, capturing player actions throughout the game loop. Environment variables are configured in `myapp/.env.local` and typed in `src/vite-env.d.ts`.

| Event | Description | File |
|---|---|---|
| `game_ended` | Fired when the game ends with a WIN or LOSS outcome. Captures final game state metrics. | `src/GateComponents/Boards/GameBoard.tsx` |
| `turn_ended` | Fired when the player ends their turn. Captures current resources, fear, and hand size. | `src/GateComponents/Boards/GameBoard.tsx` |
| `enemy_attacked` | Fired when the player attacks an enemy. Captures enemy card ID and damage dealt. | `src/GateComponents/Boards/GameBoard.tsx` |
| `card_purchased` | Fired when the player buys a card from the village row. Captures card ID and current coin count. | `src/GateComponents/Boards/GameBoard.tsx` |
| `card_played` | Fired when the player plays a card from their hand. Captures card ID and play type. | `src/GateComponents/Boards/GameBoard.tsx` |
| `fear_calmed` | Fired when the player uses calm to reduce the fearamid level. | `src/GateComponents/Boards/GameBoard.tsx` |
| `building_repaired` | Fired when the player repairs a building (farm, gate, or tower). Captures which building. | `src/GateComponents/Boards/GameBoard.tsx` |
| `resource_converted` | Fired when the player converts coins to attack, repair, or calm via action buttons. | `src/GateComponents/Boards/GameBoard.tsx` |
| `village_row_refreshed` | Fired when the player pays to refresh the village row cards. | `src/GateComponents/Boards/GameBoard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/390876/dashboard/1491771)
- **Insight**: [Game Outcomes (Win vs Loss)](https://us.posthog.com/project/390876/insights/G10TXooQ) — Bar chart of game outcomes broken down by outcome
- **Insight**: [Daily Games Played](https://us.posthog.com/project/390876/insights/id2yG8kk) — Line chart of games played per day
- **Insight**: [Game Engagement Funnel](https://us.posthog.com/project/390876/insights/PU5yCWm6) — Funnel from card_played → turn_ended → game_ended
- **Insight**: [Cards Purchased vs Cards Played](https://us.posthog.com/project/390876/insights/WkHrSc5A) — Line chart comparing purchase and play rates
- **Insight**: [Resource Conversions by Type](https://us.posthog.com/project/390876/insights/vyDo6UwB) — Bar chart of which resource conversions players prefer

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
