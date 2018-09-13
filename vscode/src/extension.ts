'use strict';

import { window, commands, ExtensionContext } from 'vscode';

export function activate(context: ExtensionContext) {
    // Enforce new paradigm on startup by moving the active tab to the front
    commands.executeCommand('moveActiveEditor', { to: 'first' });

    // Watch for when different tab is selected and then move it to the front
    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(() => {
            commands.executeCommand('moveActiveEditor', { to: 'first' });
        })
    );

    // By promoting tab on activation we prevent the user from traversing tab list forward
    // To avoid being stuck in the loop a new command is introduced, which puts the active tab 
    // at the end of the list, thus ensuring that it will not be focused on successive invocation
    context.subscriptions.push(
        commands.registerCommand('tabCycle.buryActiveEditor', () => {
            commands.executeCommand('moveActiveEditor', { to: 'last' });
            commands.executeCommand('workbench.action.nextEditorInGroup');
        })
    );
}