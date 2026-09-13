export interface CommandInfo {
  command: string;
  label: string;
  group: string;
  mac: string;
  why: string;
}

/**
 * High-frequency VS Code commands on macOS, grouped the way people actually
 * reach for them: command surfaces, navigation, edit, UI chrome, search, git, debug.
 */
export const vscodeCatalog: CommandInfo[] = [
  {
    command: "workbench.action.showCommands",
    label: "Command Palette",
    group: "Command",
    mac: "⌘⇧P",
    why: "Universal entry point for every VS Code action.",
  },
  {
    command: "workbench.action.quickOpen",
    label: "Quick Open",
    group: "Command",
    mac: "⌘P",
    why: "Jump to any file by fuzzy name.",
  },
  {
    command: "workbench.action.gotoSymbol",
    label: "Go to Symbol",
    group: "Navigate",
    mac: "⌘⇧O",
    why: "Jump inside the current file by symbol.",
  },
  {
    command: "workbench.action.showAllSymbols",
    label: "Workspace Symbol",
    group: "Navigate",
    mac: "⌘T",
    why: "Find a symbol across the whole workspace.",
  },
  {
    command: "editor.action.revealDefinition",
    label: "Go to Definition",
    group: "Navigate",
    mac: "F12",
    why: "Follow a symbol to its source.",
  },
  {
    command: "editor.action.goToReferences",
    label: "Find References",
    group: "Navigate",
    mac: "⇧F12",
    why: "List every use of the current symbol.",
  },
  {
    command: "workbench.action.navigateBack",
    label: "Navigate Back",
    group: "Navigate",
    mac: "⌃-",
    why: "Return to the previous editor location.",
  },
  {
    command: "workbench.action.navigateForward",
    label: "Navigate Forward",
    group: "Navigate",
    mac: "⌃⇧-",
    why: "Move forward in the navigation stack.",
  },
  {
    command: "editor.action.formatDocument",
    label: "Format Document",
    group: "Edit",
    mac: "⇧⌥F",
    why: "Apply the active formatter to the whole file.",
  },
  {
    command: "editor.action.commentLine",
    label: "Toggle Comment",
    group: "Edit",
    mac: "⌘/",
    why: "Comment or uncomment the current line or selection.",
  },
  {
    command: "editor.action.rename",
    label: "Rename Symbol",
    group: "Edit",
    mac: "F2",
    why: "Refactor a name across all references.",
  },
  {
    command: "editor.action.quickFix",
    label: "Quick Fix",
    group: "Edit",
    mac: "⌘.",
    why: "Open code actions and lightbulb fixes.",
  },
  {
    command: "editor.action.organizeImports",
    label: "Organize Imports",
    group: "Edit",
    mac: "⇧⌥O",
    why: "Sort and prune import statements.",
  },
  {
    command: "editor.action.clipboardCutAction",
    label: "Cut Line",
    group: "Edit",
    mac: "⌘X",
    why: "Cut the selection or current line.",
  },
  {
    command: "workbench.action.toggleSidebarVisibility",
    label: "Toggle Sidebar",
    group: "UI",
    mac: "⌘B",
    why: "Show or hide the primary sidebar.",
  },
  {
    command: "workbench.action.togglePanel",
    label: "Toggle Panel",
    group: "UI",
    mac: "⌘J",
    why: "Show or hide the bottom panel.",
  },
  {
    command: "workbench.action.terminal.toggleTerminal",
    label: "Toggle Terminal",
    group: "UI",
    mac: "⌃`",
    why: "Open or focus the integrated terminal.",
  },
  {
    command: "workbench.action.splitEditor",
    label: "Split Editor",
    group: "UI",
    mac: "⌘\\",
    why: "Split the current editor group.",
  },
  {
    command: "workbench.action.closeActiveEditor",
    label: "Close Editor",
    group: "UI",
    mac: "⌘W",
    why: "Close the active editor tab.",
  },
  {
    command: "workbench.view.explorer",
    label: "Explorer",
    group: "UI",
    mac: "⌘⇧E",
    why: "Focus the file explorer.",
  },
  {
    command: "workbench.view.search",
    label: "Search View",
    group: "Search",
    mac: "⌘⇧F",
    why: "Open the search sidebar.",
  },
  {
    command: "workbench.action.findInFiles",
    label: "Find in Files",
    group: "Search",
    mac: "⌘⇧F",
    why: "Search the workspace by text.",
  },
  {
    command: "actions.find",
    label: "Find in File",
    group: "Search",
    mac: "⌘F",
    why: "Find inside the current editor.",
  },
  {
    command: "editor.action.startFindReplaceAction",
    label: "Replace",
    group: "Search",
    mac: "⌥⌘F",
    why: "Find and replace in the current file.",
  },
  {
    command: "workbench.view.scm",
    label: "Source Control",
    group: "Git",
    mac: "⌃⇧G",
    why: "Open the Git view for diffs and commits.",
  },
  {
    command: "git.commit",
    label: "Git Commit",
    group: "Git",
    mac: "",
    why: "Commit staged changes.",
  },
  {
    command: "git.sync",
    label: "Git Sync",
    group: "Git",
    mac: "",
    why: "Pull and push the current branch.",
  },
  {
    command: "git.checkout",
    label: "Git Checkout",
    group: "Git",
    mac: "",
    why: "Switch branches.",
  },
  {
    command: "workbench.action.debug.start",
    label: "Start Debugging",
    group: "Debug",
    mac: "F5",
    why: "Launch the active debug configuration.",
  },
  {
    command: "workbench.action.debug.stop",
    label: "Stop Debugging",
    group: "Debug",
    mac: "⇧F5",
    why: "Terminate the debug session.",
  },
  {
    command: "editor.debug.action.toggleBreakpoint",
    label: "Toggle Breakpoint",
    group: "Debug",
    mac: "F9",
    why: "Set or clear a breakpoint on the current line.",
  },
  {
    command: "workbench.action.debug.stepOver",
    label: "Step Over",
    group: "Debug",
    mac: "F10",
    why: "Step over the current statement.",
  },
  {
    command: "workbench.action.tasks.runTask",
    label: "Run Task",
    group: "Command",
    mac: "",
    why: "Pick and run a workspace task.",
  },
  {
    command: "workbench.action.terminal.new",
    label: "New Terminal",
    group: "UI",
    mac: "⌃⇧`",
    why: "Create another integrated terminal.",
  },
  {
    command: "editor.action.showHover",
    label: "Show Hover",
    group: "Navigate",
    mac: "⌘K ⌘I",
    why: "Show type info and docs at the cursor.",
  },
  {
    command: "workbench.action.openSettings",
    label: "Settings",
    group: "Command",
    mac: "⌘,",
    why: "Open user settings.",
  },
];

export function catalogGroups(): string[] {
  return [...new Set(vscodeCatalog.map((item) => item.group))];
}
