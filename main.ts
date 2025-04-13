import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CsvView } from './CsvView';

export const CSV_VIEW_TYPE = "csv-view";

export default class CsvSupportPlugin extends Plugin {
	async onload() {
		console.log('Loading CSV Support Plugin');

		// Register the CSV view
		this.registerView(
			CSV_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new CsvView(leaf)
		);

		// Register the .csv file extension
		this.registerExtensions(["csv"], CSV_VIEW_TYPE);
	}

	onunload() {
		console.log('Unloading CSV Support Plugin');
	}
}
