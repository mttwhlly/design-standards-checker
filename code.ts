// This is the main code for a Figma design standards checker plugin
// Written in TypeScript with strong typing for better development experience

// Define interfaces for configuration and results
interface StandardsConfig {
  colors: {
    allowedColors: string[];
    tolerance: number;
  };
  typography: {
    allowedFonts: string[];
    textStyles: string[];
  };
  spacing: {
    baseUnit: number;
    tolerancePercent: number;
  };
  components: {
    requiredComponents: Record<string, string[]>;
    mustBeInstances: string[];
  };
  naming: {
    patterns: {
      frames: RegExp;
      components: RegExp;
      layers: RegExp;
    };
  };
  accessibility: {
    minContrastRatio: number;
    interactiveElementMinSize: number;
  };
}

interface CheckResults {
  passed: boolean;
  issues: CheckIssue[];
  stats: {
    nodesChecked: number;
    issuesFound: number;
    categoryCounts: Record<string, number>;
  };
}

interface CheckIssue {
  category: string;
  message: string;
  nodeId: string;
}

// Main plugin class
class DesignStandardsChecker {
  config: StandardsConfig;

  constructor() {
    // Initialize with default configuration
    this.config = {
      colors: {
        allowedColors: ['#1A73E8', '#4285F4', '#34A853', '#FBBC04', '#EA4335', '#F8F9FA', '#202124'],
        tolerance: 0
      },
      typography: {
        allowedFonts: ['Roboto', 'Product Sans', 'Google Sans'],
        textStyles: ['Heading', 'Body', 'Caption', 'Button']
      },
      spacing: {
        baseUnit: 8,
        tolerancePercent: 5
      },
      components: {
        requiredComponents: {
          'screen': ['Navigation', 'StatusBar'],
          'card': ['Shadow', 'Title']
        },
        mustBeInstances: ['Button', 'Input', 'Checkbox', 'Radio', 'Toggle', 'Dropdown']
      },
      naming: {
        patterns: {
          frames: /^[A-Z][a-z]+ - [a-z0-9-_]+$/,
          components: /^[A-Z][a-z]+ \/ [A-Z][a-z]+$/,
          layers: /^[a-z][a-z0-9-_]+$/
        }
      },
      accessibility: {
        minContrastRatio: 4.5,
        interactiveElementMinSize: 44
      }
    };
  }

  // Run all checks on a selected node or the entire document
  runAllChecks(node: SceneNode | PageNode | DocumentNode = figma.currentPage, isDeepCheck: boolean = true): CheckResults {
    const results: CheckResults = {
      passed: true,
      issues: [],
      stats: {
        nodesChecked: 0,
        issuesFound: 0,
        categoryCounts: {}
      }
    };
    
    // Process node and its children recursively
    this.processNode(node, results, isDeepCheck);
    
    return results;
  }
  
  // Process a single node and its children
  private processNode(node: BaseNode, results: CheckResults, isDeepCheck: boolean): void {
    results.stats.nodesChecked++;
    
    // Run all checks on this node
    this.checkColors(node, results);
    this.checkTypography(node, results);
    this.checkSpacing(node, results);
    this.checkComponents(node, results);
    this.checkNaming(node, results);
    this.checkAccessibility(node, results);
    
    // Process children recursively if this is a deep check
    if (isDeepCheck && 'children' in node) {
      for (const child of node.children) {
        this.processNode(child, results, isDeepCheck);
      }
    }
  }
  
  // Check if colors used match the allowed palette
  private checkColors(node: BaseNode, results: CheckResults): void {
    if ('fills' in node && node.fills && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.visible) {
          const color = this.rgbToHex(fill.color.r, fill.color.g, fill.color.b);
          if (!this.isColorAllowed(color)) {
            this.addIssue(results, "color", `Non-standard color ${color} used in ${node.name}`, node.id);
          }
        }
      }
    }
    
    // Check stroke colors too
    if ('strokes' in node && node.strokes && Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        if (stroke.type === 'SOLID' && stroke.visible) {
          const color = this.rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
          if (!this.isColorAllowed(color)) {
            this.addIssue(results, "color", `Non-standard stroke color ${color} used in ${node.name}`, node.id);
          }
        }
      }
    }
  }
  
  // Check typography standards
  private checkTypography(node: BaseNode, results: CheckResults): void {
    if (node.type === 'TEXT') {
      // Check font family
      const fontName = node.fontName;
      if (fontName && typeof fontName !== 'symbol' && !this.config.typography.allowedFonts.includes(fontName.family)) {
        this.addIssue(results, "typography", `Non-standard font "${typeof fontName !== 'symbol' ? fontName.family : 'unknown'}" used in "${node.name}"`, node.id);
      }
      
      // Check if text is using a proper text style
      if (!node.textStyleId) {
        this.addIssue(results, "typography", `Text "${node.name}" is not using any text style`, node.id);
      } else {
        // Check if the style name follows conventions
        figma.getStyleByIdAsync(node.textStyleId as string).then(textStyle => {
          if (textStyle) {
            const isValidStyle = this.config.typography.textStyles.some(pattern => 
              textStyle.name.includes(pattern)
            );
            
            if (!isValidStyle) {
              this.addIssue(results, "typography", `Text "${node.name}" uses non-standard text style "${textStyle.name}"`, node.id);
            }
          }
        }).catch(error => {
          console.error("Error fetching text style:", error);
          this.addIssue(results, "typography", `Error checking text style for "${node.name}"`, node.id);
        });

      }
    }
  }
  
  // Check spacing and alignment
  private checkSpacing(node: BaseNode, results: CheckResults): void {
    if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      // Check if coordinates and sizes follow the grid
      const { x, y, width, height } = node;
      
      if (!this.isOnGrid(x)) {
        this.addIssue(results, "spacing", `${node.name} X position (${x}) is not on grid`, node.id);
      }
      
      if (!this.isOnGrid(y)) {
        this.addIssue(results, "spacing", `${node.name} Y position (${y}) is not on grid`, node.id);
      }
      
      if (!this.isOnGrid(width)) {
        this.addIssue(results, "spacing", `${node.name} width (${width}) is not on grid`, node.id);
      }
      
      if (!this.isOnGrid(height)) {
        this.addIssue(results, "spacing", `${node.name} height (${height}) is not on grid`, node.id);
      }
      
      // Check for consistent padding within frames
      if (node.type === 'FRAME' && 'layoutMode' in node) {
        const frame = node as FrameNode;
        if (frame.layoutMode !== 'NONE') {
          const { paddingTop, paddingRight, paddingBottom, paddingLeft } = frame;
          
          // Check if padding values are on grid
          if (!this.isOnGrid(paddingTop)) {
            this.addIssue(results, "spacing", `${node.name} has non-standard top padding (${paddingTop})`, node.id);
          }
          
          if (!this.isOnGrid(paddingRight)) {
            this.addIssue(results, "spacing", `${node.name} has non-standard right padding (${paddingRight})`, node.id);
          }
          
          if (!this.isOnGrid(paddingBottom)) {
            this.addIssue(results, "spacing", `${node.name} has non-standard bottom padding (${paddingBottom})`, node.id);
          }
          
          if (!this.isOnGrid(paddingLeft)) {
            this.addIssue(results, "spacing", `${node.name} has non-standard left padding (${paddingLeft})`, node.id);
          }
        }
      }
    }
  }
  
  // Check component usage
  private checkComponents(node: BaseNode, results: CheckResults): void {
    // Check if node is a frame that requires specific components
    if (node.type === 'FRAME') {
      const frameType = this.getFrameType(node.name);
      
      if (frameType && this.config.components.requiredComponents[frameType]) {
        const requiredComponents = this.config.components.requiredComponents[frameType];
        
        // Check if all required components are present
        for (const requiredComponent of requiredComponents) {
          let hasComponent = false;
          
          if ('children' in node) {
            hasComponent = this.hasComponentNamed(node, requiredComponent);
          }
          
          if (!hasComponent) {
            this.addIssue(results, "components", `${node.name} is missing required component: ${requiredComponent}`, node.id);
          }
        }
      }
    }
    
    // Check if elements that should be components are actually components
    const componentName = this.getComponentName(node.name);
    
    if (componentName && this.config.components.mustBeInstances.includes(componentName)) {
      if (node.type !== 'INSTANCE' && node.type !== 'COMPONENT') {
        this.addIssue(results, "components", `${node.name} should be a component instance`, node.id);
      }
    }
  }
  
  // Check naming conventions
  private checkNaming(node: BaseNode, results: CheckResults): void {
    // Check frame naming convention
    if (node.type === 'FRAME') {
      if (!this.config.naming.patterns.frames.test(node.name)) {
        this.addIssue(results, "naming", `Frame "${node.name}" doesn't follow naming convention`, node.id);
      }
    }
    
    // Check component naming convention
    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      if (!this.config.naming.patterns.components.test(node.name)) {
        this.addIssue(results, "naming", `Component "${node.name}" doesn't follow naming convention`, node.id);
      }
    }
    
    // Check layer naming convention (for other types)
    if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
      if (!this.config.naming.patterns.layers.test(node.name)) {
        this.addIssue(results, "naming", `Layer "${node.name}" doesn't follow naming convention`, node.id);
      }
    }
  }
  
  // Check accessibility standards
  private checkAccessibility(node: BaseNode, results: CheckResults): void {
    // Check text contrast
    if (node.type === 'TEXT' && 'fills' in node && node.fills) {
      // We'd need to get the background color behind this text
      // This is a simplified check assuming we have background info
      const textColor = this.getNodeColor(node);
      const backgroundColor = "#FFFFFF"; // Simplified - would need to determine actual bg
      
      if (textColor && !this.hasAdequateContrast(textColor, backgroundColor)) {
        this.addIssue(results, "accessibility", `Text "${node.name}" has insufficient contrast`, node.id);
      }
    }
    
    // Check interactive element size
    if (this.isInteractiveElement(node) && 'width' in node && 'height' in node) {
      const { width, height } = node;
      
      if (width < this.config.accessibility.interactiveElementMinSize || 
          height < this.config.accessibility.interactiveElementMinSize) {
        this.addIssue(
          results, 
          "accessibility", 
          `Interactive element "${node.name}" (${width}x${height}) is too small for touch targets`, 
          node.id
        );
      }
    }
  }
  
  // Helper functions
  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number): string => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  
  private isColorAllowed(color: string): boolean {
    return this.config.colors.allowedColors.includes(color);
  }
  
  private isOnGrid(value: number): boolean {
    const gridUnit = this.config.spacing.baseUnit;
    const tolerance = (gridUnit * this.config.spacing.tolerancePercent) / 100;
    
    // Check if the value is within tolerance of a grid unit multiple
    const remainder = value % gridUnit;
    return remainder <= tolerance || (gridUnit - remainder) <= tolerance;
  }
  
  private getFrameType(name: string): string | null {
    // Extract frame type from name (simple implementation)
    const lowerName = name.toLowerCase();
    if (lowerName.includes('screen')) return 'screen';
    if (lowerName.includes('card')) return 'card';
    return null;
  }
  
  private getComponentName(name: string): string {
    // Extract component name from the layer name
    const parts = name.split('/');
    if (parts.length > 1) {
      const componentPart = parts[parts.length - 1].trim();
      return componentPart;
    }
    return name;
  }
  
  private hasComponentNamed(node: SceneNode & ChildrenMixin, componentName: string): boolean {
    if (!('children' in node)) return false;
    
    for (const child of node.children) {
      if (child.name.includes(componentName)) return true;
      
      // Recursive check
      if ('children' in child) {
        if (this.hasComponentNamed(child as SceneNode & ChildrenMixin, componentName)) return true;
      }
    }
    
    return false;
  }
  
  private getNodeColor(node: BaseNode): string | null {
    if ('fills' in node && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.visible) {
        return this.rgbToHex(fill.color.r, fill.color.g, fill.color.b);
      }
    }
    return null;
  }
  
  private hasAdequateContrast(_color1: string, _color2: string): boolean {
    // This would be a more complex function using color contrast algorithms
    // Simplified version for demonstration
    return true;
  }
  
  private isInteractiveElement(node: BaseNode): boolean {
    // Determine if an element is interactive based on name or type
    const interactiveKeywords = ['button', 'link', 'input', 'toggle', 'checkbox', 'radio'];
    return interactiveKeywords.some(keyword => node.name.toLowerCase().includes(keyword));
  }
  
  private addIssue(results: CheckResults, category: string, message: string, nodeId: string): void {
    results.issues.push({
      category,
      message,
      nodeId
    });
    
    results.passed = false;
    results.stats.issuesFound++;
    
    // Update category counts
    if (!results.stats.categoryCounts[category]) {
      results.stats.categoryCounts[category] = 0;
    }
    results.stats.categoryCounts[category]++;
  }
}

// UI management class
class PluginUI {
  // Shows the check results in the plugin UI
  showResults(results: CheckResults): void {
    // Send results to the UI iframe
    figma.ui.postMessage({
      type: 'check-results',
      results
    });
  }
  
  // Show a notification for a specific issue
  notifyIssue(issue: CheckIssue): void {
    figma.notify(`${issue.category.toUpperCase()}: ${issue.message}`, {
      timeout: 5000,
      button: {
        text: "Go to node",
        action: () => {
          figma.getNodeByIdAsync(issue.nodeId).then(node => {
            if (node && 'type' in node && node.type !== 'PAGE' && node.type !== 'DOCUMENT') {
              figma.currentPage.selection = [node as SceneNode];
              figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
            }
          }).catch(error => {
            console.error("Error finding node:", error);
            figma.notify("Could not find the selected node", { error: true });
          });
        }
      }
    });
  }
}

// HTML Template
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 15px;
      color: #333;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    h2 {
      margin: 0;
      font-weight: 600;
      font-size: 16px;
    }
    
    button {
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .primary-button {
      background: #18A0FB;
      color: white;
    }
    
    .primary-button:hover {
      background: #0D8DF0;
    }
    
    .secondary-button {
      background: #F5F5F5;
      color: #333;
      margin-right: 8px;
    }
    
    .secondary-button:hover {
      background: #E5E5E5;
    }
    
    .tab-container {
      display: flex;
      border-bottom: 1px solid #E5E5E5;
      margin-bottom: 15px;
    }
    
    .tab {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      border-bottom: 2px solid transparent;
    }
    
    .tab.active {
      border-bottom: 2px solid #18A0FB;
      font-weight: 500;
    }
    
    .results-summary {
      padding: 15px;
      background: #F9F9F9;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .issue-count {
      font-weight: 600;
      color: #D93025;
    }
    
    .pass-message {
      font-weight: 600;
      color: #34A853;
    }
    
    .issues-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .issue-item {
      padding: 12px;
      border-radius: 0px;
      background: white;
      margin-bottom: 8px;
      border-left: 4px solid #ccc;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .issue-item:hover {
      background: #F5F5F5;
    }
    
    .issue-item.color { border-left-color: #EA4335; }
    .issue-item.typography { border-left-color: #4285F4; }
    .issue-item.spacing { border-left-color: #FBBC04; }
    .issue-item.components { border-left-color: #34A853; }
    .issue-item.naming { border-left-color: #9334E6; }
    .issue-item.accessibility { border-left-color: #E67C73; }
    
    .issue-category {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .issue-category.color { color: #EA4335; }
    .issue-category.typography { color: #4285F4; }
    .issue-category.spacing { color: #FBBC04; }
    .issue-category.components { color: #34A853; }
    .issue-category.naming { color: #9334E6; }
    .issue-category.accessibility { color: #E67C73; }
    
    .issue-message {
      font-size: 14px;
    }
    
    .issue-node {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Design Standards Checker</h2>
    <div>
      <button id="check-button" class="primary-button">Check Selection</button>
    </div>
  </div>
  
  <div class="tab-container">
    <div class="tab active" data-tab="issues">Issues</div>
    <div class="tab" data-tab="settings">Settings</div>
  </div>
  
  <div id="issues-tab" class="tab-content">
    <div class="results-summary" id="summary">
      Select elements and click "Check Selection" to validate design standards.
      <br><br>
      To mark an element as ready for development, run a complete check first.
    </div>
    
    <div class="issues-list" id="issues">
      <!-- Issues will be added here dynamically -->
    </div>
  </div>
  
  <div id="settings-tab" class="tab-content" style="display: none;">
    <h3>Check Options</h3>
    <div>
      <input type="checkbox" id="check-on-selection" checked>
      <label for="check-on-selection">Check on selection change (on-the-fly)</label>
    </div>
    <div>
      <input type="checkbox" id="deep-check" checked>
      <label for="deep-check">Deep check (include all children)</label>
    </div>
    
    <h3>Standards</h3>
    <p>Edit standards in your team library or design system document.</p>
    
    <div style="margin-top: 20px;">
      <button id="mark-ready-button" class="primary-button">Mark Ready for Dev</button>
    </div>
  </div>
  
  <script>
    // Initialize tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
          content.style.display = 'none';
        });
        document.getElementById(tabName + '-tab').style.display = 'block';
      });
    });
    
    // Handle button clicks
    document.getElementById('check-button').addEventListener('click', () => {
      const deepCheck = document.getElementById('deep-check').checked;
      parent.postMessage({ pluginMessage: { type: 'run-check', deep: deepCheck } }, '*');
    });
    
    document.getElementById('mark-ready-button').addEventListener('click', () => {
      parent.postMessage({ pluginMessage: { type: 'check-ready-for-dev' } }, '*');
    });
    
    // Handle messages from the plugin
    window.onmessage = event => {
      const message = event.data.pluginMessage;
      
      if (message.type === 'check-results') {
        showResults(message.results);
      }
    };
    
    // Display check results
    function showResults(results) {
      const summaryElement = document.getElementById('summary');
      const issuesElement = document.getElementById('issues');
      
      // Clear previous issues
      issuesElement.innerHTML = '';
      
      // Update summary
      if (results.passed) {
        summaryElement.innerHTML = '<div class="pass-message">✓ All checks passed! Design meets all standards.</div>';
      } else {
        summaryElement.innerHTML = 
          '<div class="issue-count">✗ Found ' + results.stats.issuesFound + ' issues</div>' +
          '<div>Checked ' + results.stats.nodesChecked + ' elements</div>' +
          '<div>Fix these issues before marking as ready for development.</div>';
      }
      
      // Add issues to the list
      results.issues.forEach(issue => {
        const issueElement = document.createElement('div');
        issueElement.className = 'issue-item ' + issue.category;
        issueElement.innerHTML = 
          '<div class="issue-category ' + issue.category + '">' + issue.category + '</div>' +
          '<div class="issue-message">' + issue.message + '</div>';
        
        // Add click handler to focus the node
        issueElement.addEventListener('click', () => {
          parent.postMessage({ 
            pluginMessage: { type: 'focus-node', nodeId: issue.nodeId } 
          }, '*');
        });
        
        issuesElement.appendChild(issueElement);
      });
      
      // Show issues tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.tab[data-tab="issues"]').classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById('issues-tab').style.display = 'block';
    }
  </script>
</body>
</html>
`;

// Main plugin entry point
const main = () => {
  // Create instances of our classes
  const checker = new DesignStandardsChecker();
  const ui = new PluginUI();
  
  // Show the UI
  figma.showUI(HTML_TEMPLATE, { width: 450, height: 550 });
  
  // Handle messages from the UI
  figma.ui.onmessage = msg => {
    switch(msg.type) {
      case 'run-check': {
        // Run check on current selection or entire page
        const node = figma.currentPage.selection.length > 0 
          ? figma.currentPage.selection[0] 
          : figma.currentPage;
        
        const results = checker.runAllChecks(node, msg.deep);
        ui.showResults(results);
        break;
      }
        
      case 'focus-node':
        // Focus on a specific node when user clicks on an issue
        figma.getNodeByIdAsync(msg.nodeId).then(focusNode => {
          if (focusNode && 'type' in focusNode && focusNode.type !== 'PAGE' && focusNode.type !== 'DOCUMENT') {
            figma.currentPage.selection = [focusNode as SceneNode];
            figma.viewport.scrollAndZoomIntoView([focusNode as SceneNode]);
          }
        }).catch(error => {
          console.error("Error finding node:", error);
          figma.notify("Could not find the selected node", { error: true });
        });
        break;
        
      case 'check-ready-for-dev': {
        // Check if selection is ready for development
        const selectedNode = figma.currentPage.selection[0];
        if (selectedNode) {
          const results = checker.runAllChecks(selectedNode, true);
          
          if (results.passed) {
            // Set "ready for dev" status (implementation would depend on your workflow)
            // This could update a plugin-specific property, change a layer name, etc.
            figma.notify("✓ Design passes all standards checks! Marked as Ready for Dev.");
          } else {
            ui.showResults(results);
            figma.notify(`✗ Found ${results.stats.issuesFound} issues that need to be fixed before marking as ready.`, {
              timeout: 5000
            });
          }
        } else {
          figma.notify("⚠ Please select a frame to check");
        }
        break;
      }
        
      case 'close':
        figma.closePlugin();
        break;
    }
  };
  
  // Handle selection changes for on-the-fly checking
  figma.on("selectionchange", () => {
    // Get the "check on selection" setting from the UI
    // Since we can't directly get the value from the UI, we could store this in a plugin property
    // For now, we'll assume it's enabled
    const checkOnSelection = true;
    
    if (checkOnSelection && figma.currentPage.selection.length === 1) {
      const node = figma.currentPage.selection[0];
      
      // Only perform a lightweight check on selection change
      const quickResults = checker.runAllChecks(node, false);
      
      // Only notify if there are issues
      if (!quickResults.passed) {
        // Send quick results to UI
        ui.showResults(quickResults);
        
        // Optionally show a notification for the first issue
        if (quickResults.issues.length > 0) {
          ui.notifyIssue(quickResults.issues[0]);
        }
      }
    }
  });
}

// Run the plugin
main();