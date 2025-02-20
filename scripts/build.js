const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

async function build() {
  try {
    // Ensure the public directory exists
    await fs.ensureDir('public');

    // Copy static assets (only if they exist)
    if (await fs.pathExists('src/styles')) {
      await fs.copy('src/styles', 'public/styles');
    }
    if (await fs.pathExists('src/scripts')) {
      await fs.copy('src/scripts', 'public/scripts');
    }

    // Build pages
    const pagesDir = path.join(__dirname, '../src/content/pages');
    console.log('Pages directory:', pagesDir);
    
    const files = await fs.readdir(pagesDir);
    console.log('Found files:', files);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        console.log('Processing:', file);
        
        const content = await fs.readFile(path.join(pagesDir, file), 'utf-8');
        console.log('Content:', content);
        
        // Extract title from the Markdown content
        const titleMatch = content.match(/<!-- title: (.+?) -->/);
        const title = titleMatch ? titleMatch[1] : 'Default Title'; // Fallback title

        const html = marked(content);
        console.log('Converted HTML:', html);
        
        const template = await fs.readFile(path.join(__dirname, '../src/templates/page.html'), 'utf-8');
        const finalHtml = template.replace('{{content}}', html).replace('{{title}}', title);
        
        const outputPath = path.join('public', file.replace('.md', '.html'));
        console.log('Writing to:', outputPath);
        
        await fs.writeFile(outputPath, finalHtml);
      }
    }

    // Copy contact form template
    const contactTemplate = await fs.readFile(path.join(__dirname, '../src/templates/contact.html'), 'utf-8');
    await fs.writeFile(path.join('public', 'contact.html'), contactTemplate);
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    throw error;
  }
}

build().catch(console.error); 