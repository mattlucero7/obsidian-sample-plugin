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
	}	// Format CSV content to display nicely with proper line elements and colorization
	private formatCsvContent(csvData: string): string {
		// First check if this is HTML content already - if we see HTML tags, this is a reopening
		if (csvData.includes('<span class="csv-')) {
			// return the raw data then reformat properly
			return this.extractRawCsvFromHtml(csvData);
		}

		// then split by newlines
		const lines = csvData.split('\n');
		
		// Convert each line to a proper cm-line div with colorized fields
		return lines.map(line => {
			const colorizedLine = this.colorizeFields(line);
			return `<div class="cm-line" dir="ltr">${colorizedLine}</div>`;
		}).join('');
	}
	
	// Extract raw CSV data from HTML-formatted content
	private extractRawCsvFromHtml(htmlData: string): string {
		// Create a temporary div to parse the HTML
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = htmlData;
		
		// Get text content from each line
		const lines = Array.from(tempDiv.querySelectorAll('.cm-line'))
			.map(line => line.textContent || '');
		
		// Return raw CSV data
		return lines.map(line => {
			const rawDiv = document.createElement('div');
			rawDiv.classList.add('cm-line');
			rawDiv.setAttribute('dir', 'ltr');
			rawDiv.textContent = line;
			return rawDiv.outerHTML;
		}).join('');
	}
	
	// 🤔 okay parse and colorize CSV fields (only happens during file opening)
	private colorizeFields(line: string): string {
		if (!line.trim()) return '';
		
		const result: string[] = [];
		let currentField = '';
		let inQuotes = false;
		let columnIndex = 0;
		
		// then parse character by character to handle quoted fields correctly
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			const nextChar = i < line.length - 1 ? line[i + 1] : '';
			
			// have to handle double quotes (escaped quotes)
			if (char === '"' && inQuotes && nextChar === '"') {
				currentField += '"'; // Add a single quote
				i++; // Skip next quote
				continue;
			}
			
			// then toggle quote state
			if (char === '"') {
				inQuotes = !inQuotes;
				// Add opening/closing quote with styling yup
				currentField += '"'; // Just store the quote character normally
				continue;
			}
			
			// Handle field delimiter (comma) for COMMA separated values
			if (char === ',' && !inQuotes) {
				// Create a colored span for this field
				const fieldSpan = document.createElement('span');
				fieldSpan.className = `csv-field-${columnIndex % 7}`;
				fieldSpan.textContent = currentField;
				result.push(fieldSpan.outerHTML);
				
				// Create a delimiter span
				const delimiterSpan = document.createElement('span');
				delimiterSpan.className = 'csv-delimiter';
				delimiterSpan.textContent = ',';
				result.push(delimiterSpan.outerHTML);
				
				// then reset for next field
				currentField = '';
				columnIndex++;
				continue;
			}
			
			// Add character to current field
			currentField += char;
		}
		
		// then add the last field
		if (currentField || columnIndex > 0) {
			// Create a colored span for the last field
			const fieldSpan = document.createElement('span');
			fieldSpan.className = `csv-field-${columnIndex % 7}`;
			fieldSpan.textContent = currentField;
			result.push(fieldSpan.outerHTML);
		}
		
		return result.join('');
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
