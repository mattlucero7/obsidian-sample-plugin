import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { CSV_VIEW_TYPE } from './main';

export class CsvView extends TextFileView {
	data: string;
	private contentArea: HTMLDivElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return CSV_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || 'CSV File';
	}

	// Load csv file content into the view
	setViewData(data: string, clear: boolean): void {
		this.data = data;
		
		// Clear the content element
		this.contentEl.empty();
		
		// Apply Obsidian's classes directly to our content element to match the editor styling
		this.contentEl.addClass('markdown-source-view');
		this.contentEl.addClass('mod-cm6');
		this.contentEl.addClass('is-live-preview');

		// Create a structure matching Obsidian's editor
		const editorEl = this.contentEl.createDiv({ cls: 'cm-editor ͼ1 ͼ2' });
		const scrollerEl = editorEl.createDiv({ cls: 'cm-scroller' });
		const sizerEl = scrollerEl.createDiv({ cls: 'cm-sizer' });
		
		// Create content container and gutter structure like Obsidian
		const contentContainerEl = sizerEl.createDiv({ cls: 'cm-contentContainer' });
		const guttersEl = contentContainerEl.createDiv({ cls: 'cm-gutters' });
		guttersEl.setAttribute('aria-hidden', 'true');
		
		// Create the editable content area as a div (not textarea) like Obsidian does
		this.contentArea = contentContainerEl.createDiv({
			cls: 'csv-content cm-content cm-lineWrapping'
		});
		
		// Set attributes similar to Obsidian's editor
		this.contentArea.setAttribute('spellcheck', 'false');
		this.contentArea.setAttribute('autocorrect', 'on');
		this.contentArea.setAttribute('autocapitalize', 'on');
		this.contentArea.setAttribute('translate', 'no');
		this.contentArea.setAttribute('contenteditable', 'true');
		this.contentArea.setAttribute('role', 'textbox');
		this.contentArea.setAttribute('aria-multiline', 'true');
		this.contentArea.style.tabSize = '4';
		
		// Format the CSV data with line breaks
		const formattedData = this.formatCsvContent(data);
		this.contentArea.innerHTML = formattedData;
		
		// Add event listener to update data when content changes
		this.contentArea.addEventListener('input', () => {
			this.data = this.contentArea.innerText;
			this.requestSave();
		});
	}
	// Format CSV content to display nicely with proper line elements
	private formatCsvContent(csvData: string): string {
		// Split by newlines
		const lines = csvData.split('\n');
		
		// Convert each line to a proper cm-line div
		return lines.map(line => {
			return `<div class="cm-line" dir="ltr">${this.escapeHtml(line)}</div>`;
		}).join('');
	}
	
	// Helper to escape HTML characters
	private escapeHtml(text: string): string {
		const element = document.createElement('div');
		element.innerText = text;
		return element.innerHTML;
	}

	// Retrieve the current content from the view
	getViewData(): string {
		if (this.contentArea) {
        // This collects text from each line div separately to preserve CSV structure!! DO NOT REMOVE!! 😫
			const lines = Array.from(this.contentArea.querySelectorAll('.cm-line'))
				.map(line => line.textContent || '');
			
			// THEN Join with newlines to maintain CSV format
			return lines.join('\n');
		}
		return this.data;
	}

	// Clear the content if closed or switched
	clear(): void {
		this.data = '';
		this.contentEl.empty();
	}
}

// Ensure this file is treated as a module
export {};
