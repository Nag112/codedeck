# Default shortcuts

macOS VS Code bindings used in the factory 12-key profile. Sources: [VS Code keyboard shortcuts](https://code.visualstudio.com/docs/getstarted/keybindings) and the commands people actually use in the Command Palette.

| Key | Command ID | Default chord | Why it is on the deck |
| --- | --- | --- | --- |
| 0 | `workbench.action.showCommands` | ⌘⇧P | Catch-all |
| 1 | `workbench.action.quickOpen` | ⌘P | File hopping |
| 2 | `workbench.action.terminal.toggleTerminal` | ⌃\` | Terminal |
| 3 | `workbench.action.toggleSidebarVisibility` | ⌘B | Screen space |
| 4 | `editor.action.formatDocument` | ⇧⌥F | Format |
| 5 | `editor.action.revealDefinition` | F12 | Code navigation |
| 6 | `workbench.action.findInFiles` | ⌘⇧F | Workspace search |
| 7 | `workbench.view.scm` | ⌃⇧G | Git view |
| 8 | `editor.action.commentLine` | ⌘/ | Comment |
| 9 | `workbench.action.splitEditor` | ⌘\\ | Layout |
| 10 | `editor.action.quickFix` | ⌘. | Lightbulb |
| 11 | `workbench.action.debug.start` | F5 | Debug |

The 9-key profile is the first nine rows. The catalog in `packages/protocol/src/catalog.ts` lists additional commands you can assign in the Mac app (rename, organize imports, git sync, step over, settings, …).

The extension runs **command IDs**, so customized VS Code keybindings still work: the keypad does not depend on the chord staying default.
