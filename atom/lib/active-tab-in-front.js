'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.workspace.getCenter().observePanes(pane => {
        let scheduledImmediate;

        this.subscriptions.add(
          pane.observeActiveItem((item) => {
            if (!item) {
              return;
            }

            if (scheduledImmediate) {
              clearImmediate(scheduledImmediate);
            }

            // Rearranging needs to be scheduled asynchronously to avoid
            // conflict with the removal process.
            scheduledImmediate = setImmediate(() => {
              scheduledImmediate = null;

              pane.moveItem(item, 0);
            });
          })
        )
      })
    );

    // This command provides a more useful mechanism for switching to next item
    // considering the nature of this package. It's advised to use it in place
    // pane:show-next-item since the original command will only loop through
    // between first two items when invoked continously.
    this.subscriptions.add(
      atom.commands.add(
        'atom-workspace',
        {
          'active-tab-in-front:bury-active-item': this.buryActiveItem,
        },
      )
    );
  },

  /**
   * Move active item in the active pane to the end of all other items
   */
  buryActiveItem() {
    const pane = atom.workspace.getActivePane();
    const item = pane.getActiveItem();
    const len = pane.getItems().length;

    pane.moveItem(item, len - 1);
    pane.activateItemAtIndex(0);
  },

  deactivate() {
    this.subscriptions.dispose();
  }
};
