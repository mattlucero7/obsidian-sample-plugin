import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { CSV_VIEW_TYPE } from './main';

export class CsvView extends TextFileView {
	data: string;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return CSV_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || 'CSV File';
	}
	private textareaEl: HTMLTextAreaElement;
		// Load csv file content into the view
	setViewData(data: string, clear: boolean): void {
		this.data = data;
		
		// Clear the content element
		this.contentEl.empty();
		
		// Create an editor container similar to Obsidian's editor
		const editorContainer = this.contentEl.createDiv({ cls: 'csv-editor-container' });
		
		// Create a textarea element for displaying and editing the CSV content
		this.textareaEl = document.createElement('textarea');
		this.textareaEl.addClass('csv-content');
		this.textareaEl.addClass('cm-editor');  // Add CodeMirror editor class for similar styling
		this.textareaEl.value = data;
		
		// Add event listener to update data when textarea changes
		this.textareaEl.addEventListener('input', () => {
			this.data = this.textareaEl.value;
			this.requestSave();
		});
		
		editorContainer.appendChild(this.textareaEl);
	}

	// Retrieve the current content from the view
	getViewData(): string {
		return this.textareaEl ? this.textareaEl.value : this.data;
	}

	// Clear the content if closed or switched
	clear(): void {
		this.data = '';
		this.contentEl.empty();
	}
}

// Ensure this file is treated as a module
export {};
