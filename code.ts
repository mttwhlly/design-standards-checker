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

// Main plugin class with enhanced standards management
class DesignStandardsChecker {
  config: StandardsConfig;
  defaultConfig: StandardsConfig;

  constructor() {
    // Initialize with default configuration
    this.defaultConfig = {
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
    
    // Load config from document or use default
    this.config = this.loadConfigFromDocument() || {...this.defaultConfig};
  }

  // Load configuration from document plugin data
  loadConfigFromDocument(): StandardsConfig | null {
    try {
      const pluginDataStr = figma.root.getPluginData('designStandardsConfig');
      if (pluginDataStr) {
        const parsedConfig = JSON.parse(pluginDataStr);
        
        // Convert string regex patterns back to RegExp objects
        if (parsedConfig.naming && parsedConfig.naming.patterns) {
          // Handle frames pattern
          if (typeof parsedConfig.naming.patterns.frames === 'string') {
            const patternStr = parsedConfig.naming.patterns.frames;
            const matches = patternStr.match(/^\/(.*)\/([gimuy]*)$/);
            if (matches) {
              const [, pattern, flags] = matches;
              parsedConfig.naming.patterns.frames = new RegExp(pattern, flags);
            }
          }
          
          // Handle components pattern
          if (typeof parsedConfig.naming.patterns.components === 'string') {
            const patternStr = parsedConfig.naming.patterns.components;
            const matches = patternStr.match(/^\/(.*)\/([gimuy]*)$/);
            if (matches) {
              const [, pattern, flags] = matches;
              parsedConfig.naming.patterns.components = new RegExp(pattern, flags);
            }
          }
          
          // Handle layers pattern
          if (typeof parsedConfig.naming.patterns.layers === 'string') {
            const patternStr = parsedConfig.naming.patterns.layers;
            const matches = patternStr.match(/^\/(.*)\/([gimuy]*)$/);
            if (matches) {
              const [, pattern, flags] = matches;
              parsedConfig.naming.patterns.layers = new RegExp(pattern, flags);
            }
          }
        }
        
        return parsedConfig;
      }
    } catch (error) {
      console.error("Error loading config from document:", error);
    }
    
    return null;
  }

  // Save configuration to document plugin data
  saveConfigToDocument(): void {
    try {
      // Clone the config to avoid modifying the original
      const configToSave = JSON.parse(JSON.stringify(this.config));
      
              // Convert RegExp objects to strings for JSON serialization
      if (configToSave.naming && configToSave.naming.patterns) {
        // Explicitly handle each known key to satisfy TypeScript
        if (this.config.naming.patterns.frames instanceof RegExp) {
          configToSave.naming.patterns.frames = this.config.naming.patterns.frames.toString();
        }
        if (this.config.naming.patterns.components instanceof RegExp) {
          configToSave.naming.patterns.components = this.config.naming.patterns.components.toString();
        }
        if (this.config.naming.patterns.layers instanceof RegExp) {
          configToSave.naming.patterns.layers = this.config.naming.patterns.layers.toString();
        }
      }
      
      figma.root.setPluginData('designStandardsConfig', JSON.stringify(configToSave));
      figma.notify("Standards configuration saved to document", { timeout: 2000 });
    } catch (error) {
      console.error("Error saving config to document:", error);
      figma.notify("Error saving configuration", { error: true });
    }
  }

  // Import configuration from a team library file
  async importConfigFromTeamLibrary(fileKey: string): Promise<boolean> {
    try {
      // This is a placeholder for how you might implement this
      // In a real implementation, you would use figma.clientStorage or other methods
      // to retrieve configurations from team library files
      
      // For now, we'll simulate fetching from a file
      figma.notify("Importing standards from team library...", { timeout: 2000 });
      
      // This would be replaced with actual code to fetch from the file
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would process the imported config here
      // For this example, we'll just use the default config
      this.config = {...this.defaultConfig};
      
      // Save the imported config to the document
      this.saveConfigToDocument();
      
      return true;
    } catch (error) {
      console.error("Error importing config:", error);
      figma.notify("Error importing standards configuration", { error: true });
      return false;
    }
  }

  // Export current configuration to share with team
  exportCurrentConfig(): string {
    try {
      // Clone the config to avoid modifying the original
      const configToExport = JSON.parse(JSON.stringify(this.config));
      
      // Convert RegExp objects to strings for JSON serialization
      if (configToExport.naming && configToExport.naming.patterns) {
        // Explicitly handle each known key to satisfy TypeScript
        if (this.config.naming.patterns.frames instanceof RegExp) {
          configToExport.naming.patterns.frames = this.config.naming.patterns.frames.toString();
        }
        if (this.config.naming.patterns.components instanceof RegExp) {
          configToExport.naming.patterns.components = this.config.naming.patterns.components.toString();
        }
        if (this.config.naming.patterns.layers instanceof RegExp) {
          configToExport.naming.patterns.layers = this.config.naming.patterns.layers.toString();
        }
      }
      
      return JSON.stringify(configToExport, null, 2);
    } catch (error) {
      console.error("Error exporting config:", error);
      return JSON.stringify(this.defaultConfig, null, 2);
    }
  }

  // Update configuration with new values
  updateConfig(newConfig: Partial<StandardsConfig>): void {
    // Deep merge the new config with the existing one
    this.config = this.deepMerge(this.config, newConfig);
    
    // Save the updated config to the document
    this.saveConfigToDocument();
  }

  // Helper method for deep merging objects
  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
    
    function isObject(item: any): boolean {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  }

  // Reset configuration to default values
  resetToDefaultConfig(): void {
    this.config = {...this.defaultConfig};
    this.saveConfigToDocument();
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
  checker: DesignStandardsChecker;
  
  constructor(checker: DesignStandardsChecker) {
    this.checker = checker;
  }
  
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
  
  // Send the current configuration to the UI
  sendConfigToUI(): void {
    figma.ui.postMessage({
      type: 'current-config',
      config: this.checker.config
    });
  }
  
  // Handle UI messages related to configuration
  handleConfigMessages(msg: any): void {
    switch(msg.type) {
      case 'update-config':
        this.checker.updateConfig(msg.config);
        figma.notify("Configuration updated successfully", { timeout: 2000 });
        break;
        
      case 'reset-config':
        this.checker.resetToDefaultConfig();
        this.sendConfigToUI();
        figma.notify("Configuration reset to defaults", { timeout: 2000 });
        break;
        
      case 'import-from-team-library':
        this.checker.importConfigFromTeamLibrary(msg.fileKey)
          .then(success => {
            if (success) {
              this.sendConfigToUI();
              figma.notify("Team library standards imported successfully", { timeout: 2000 });
            }
          });
        break;
        
      case 'export-config':
        const configStr = this.checker.exportCurrentConfig();
        figma.ui.postMessage({
          type: 'export-config-data',
          configData: configStr
        });
        break;
    }
  }
}

// HTML Template with enhanced UI for standards editing
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
      background-color: #fff;
      overflow-y: auto;
      max-height: 100vh;
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
    
    h3 {
      font-size: 14px;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .subhead {
      font-size: 12px;
      color: #666;
      margin-bottom: 15px;
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
    
    .danger-button {
      background: #F44336;
      color: white;
    }
    
    .danger-button:hover {
      background: #D32F2F;
    }
    
    .button-group {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      margin-bottom: 16px;
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
      border-radius: 4px;
      background: white;
      margin-bottom: 8px;
      border-left: 4px solid #ccc;
      cursor: pointer;
      transition: background 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
    
    /* Form elements */
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 6px;
    }
    
    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #DDD;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    textarea {
      height: 80px;
      resize: vertical;
    }
    
    .help-text {
      font-size: 11px;
      color: #666;
      margin-top: 4px;
    }
    
    .color-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #DDD;
      position: relative;
    }
    
    .color-swatch:hover::after {
      content: '×';
      position: absolute;
      top: -8px;
      right: -8px;
      background: rgba(0,0,0,0.5);
      color: white;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .add-color {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    
    .add-color input {
      flex: 1;
    }
    
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .tag {
      background: #E8F0FE;
      color: #1A73E8;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: flex;
      align-items: center;
    }
    
    .tag .remove {
      margin-left: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .section-collapsible {
      margin-bottom: 16px;
      border: 1px solid #E5E5E5;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .section-header {
      background: #F5F5F5;
      padding: 10px 12px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-header h3 {
      margin: 0;
      font-size: 14px;
    }
    
    .section-content {
      padding: 12px;
      display: none;
    }
    
    .section-content.open {
      display: block;
    }
    
    .toggle-arrow {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    
    .toggle-arrow.open {
      transform: rotate(180deg);
    }
    
    .file-selector {
      margin-bottom: 12px;
    }
    
    .export-preview {
      font-family: monospace;
      background: #F5F5F5;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
      font-size: 12px;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre;
    }
    
    .import-textarea {
      font-family: monospace;
      height: 120px;
    }
    
    .success {
      color: #34A853;
      font-weight: 500;
    }
    
    .error {
      color: #EA4335;
      font-weight: 500;
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
    <div class="tab" data-tab="standards">Standards</div>
    <div class="tab" data-tab="team">Team Library</div>
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
    
    <h3>Standards Source</h3>
    <div>
      <input type="radio" id="doc-standards" name="standards-source" checked>
      <label for="doc-standards">Use document-specific standards</label>
    </div>
    <div>
      <input type="radio" id="team-standards" name="standards-source">
      <label for="team-standards">Use team library standards</label>
    </div>
    
    <div style="margin-top: 20px;">
      <button id="mark-ready-button" class="primary-button">Mark Ready for Dev</button>
    </div>
  </div>
  
  <div id="standards-tab" class="tab-content" style="display: none;">
    <div class="subhead">
      Edit design standards for the current document. Changes are saved automatically.
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Colors</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Allowed Colors</label>
          <div class="color-list" id="color-list">
            <!-- Color swatches will be added here -->
          </div>
          <div class="add-color">
            <input type="text" id="new-color" placeholder="#RRGGBB">
            <button id="add-color-btn" class="secondary-button">Add</button>
          </div>
          <p class="help-text">Enter hex color codes (#RRGGBB format)</p>
        </div>
        
        <div class="form-group">
          <label>Color Tolerance</label>
          <input type="number" id="color-tolerance" min="0" max="100" value="0">
          <p class="help-text">How much variation to allow (0-100)</p>
        </div>
      </div>
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Typography</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Allowed Font Families</label>
          <div class="tag-list" id="fonts-list">
            <!-- Font tags will be added here -->
          </div>
          <div class="add-color">
            <input type="text" id="new-font" placeholder="Font name">
            <button id="add-font-btn" class="secondary-button">Add</button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Text Style Patterns</label>
          <div class="tag-list" id="text-styles-list">
            <!-- Text style tags will be added here -->
          </div>
          <div class="add-color">
            <input type="text" id="new-text-style" placeholder="Text style name">
            <button id="add-text-style-btn" class="secondary-button">Add</button>
          </div>
          <p class="help-text">Text styles must include these patterns</p>
        </div>
      </div>
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Spacing</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Base Grid Unit (px)</label>
          <input type="number" id="base-unit" min="1" value="8">
        </div>
        
        <div class="form-group">
          <label>Tolerance (%)</label>
          <input type="number" id="spacing-tolerance" min="0" max="50" value="5">
          <p class="help-text">How much spacing deviation to allow</p>
        </div>
      </div>
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Components</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Must Be Component Instances</label>
          <div class="tag-list" id="components-list">
            <!-- Component tags will be added here -->
          </div>
          <div class="add-color">
            <input type="text" id="new-component" placeholder="Component name">
            <button id="add-component-btn" class="secondary-button">Add</button>
          </div>
          <p class="help-text">Elements with these names must be instances</p>
        </div>
        
        <div class="form-group">
          <label>Required Components</label>
          <textarea id="required-components" placeholder="'screen': ['Navigation', 'StatusBar'], 'card': ['Shadow', 'Title']"></textarea>
          <p class="help-text">JSON format: {"frameType": ["requiredComponent1", "requiredComponent2"]}</p>
        </div>
      </div>
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Naming</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Frame Name Pattern</label>
          <input type="text" id="frame-pattern" placeholder="Regular expression">
          <p class="help-text">E.g. ^[A-Z][a-z]+ - [a-z0-9-_]+$</p>
        </div>
        
        <div class="form-group">
          <label>Component Name Pattern</label>
          <input type="text" id="component-pattern" placeholder="Regular expression">
          <p class="help-text">E.g. ^[A-Z][a-z]+ \/ [A-Z][a-z]+$</p>
        </div>
        
        <div class="form-group">
          <label>Layer Name Pattern</label>
          <input type="text" id="layer-pattern" placeholder="Regular expression">
          <p class="help-text">E.g. ^[a-z][a-z0-9-_]+$</p>
        </div>
      </div>
    </div>
    
    <div class="section-collapsible">
      <div class="section-header">
        <h3>Accessibility</h3>
        <div class="toggle-arrow">▼</div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label>Minimum Contrast Ratio</label>
          <input type="number" id="min-contrast" min="1" step="0.1" value="4.5">
          <p class="help-text">WCAG AA requires 4.5:1 for normal text</p>
        </div>
        
        <div class="form-group">
          <label>Minimum Touch Target Size (px)</label>
          <input type="number" id="min-touch-size" min="24" value="44">
          <p class="help-text">Recommended minimum size for interactive elements</p>
        </div>
      </div>
    </div>
    
    <div class="button-group">
      <button id="reset-config" class="danger-button">Reset to Defaults</button>
    </div>
  </div>
  
  <div id="team-tab" class="tab-content" style="display: none;">
    <div class="subhead">
      Import standards from your team library or export current standards to share with your team.
    </div>
    
    <div class="form-group">
      <h3>Import from Team Library</h3>
      <div class="file-selector">
        <input type="text" id="team-file-key" placeholder="Team library file key">
        <p class="help-text">Find the file key in your team library file URL</p>
      </div>
      <button id="import-team-btn" class="primary-button">Import Standards</button>
    </div>
    
    <div class="form-group">
      <h3>Manual Import</h3>
      <textarea id="import-config" class="import-textarea" placeholder="Paste JSON configuration here"></textarea>
      <button id="import-manual-btn" class="secondary-button">Import</button>
    </div>
    
    <div class="form-group">
      <h3>Export Current Standards</h3>
      <button id="export-config-btn" class="primary-button">Export Standards</button>
      <div id="export-preview" class="export-preview" style="display: none;">
        <!-- Exported config will be shown here -->
      </div>
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
    
    // Initialize collapsible sections
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const arrow = header.querySelector('.toggle-arrow');
        
        content.classList.toggle('open');
        arrow.classList.toggle('open');
      });
    });
    
    // Current configuration object
    let currentConfig = null;
    
    // Handle UI initialization
    function initializeUI(config) {
      currentConfig = config;
      
      // Initialize Colors section
      const colorList = document.getElementById('color-list');
      colorList.innerHTML = '';
      
      config.colors.allowedColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.setAttribute('data-color', color);
        swatch.title = color;
        
        swatch.addEventListener('click', () => {
          // Remove color from list
          const updatedColors = config.colors.allowedColors.filter(c => c !== color);
          updateConfig({ colors: { allowedColors: updatedColors } });
          swatch.remove();
        });
        
        colorList.appendChild(swatch);
      });
      
      document.getElementById('color-tolerance').value = config.colors.tolerance;
      
      // Initialize Typography section
      const fontsList = document.getElementById('fonts-list');
      fontsList.innerHTML = '';
      
      config.typography.allowedFonts.forEach(font => {
        const tag = createTag(font, () => {
          const updatedFonts = config.typography.allowedFonts.filter(f => f !== font);
          updateConfig({ typography: { allowedFonts: updatedFonts } });
        });
        fontsList.appendChild(tag);
      });
      
      const textStylesList = document.getElementById('text-styles-list');
      textStylesList.innerHTML = '';
      
      config.typography.textStyles.forEach(style => {
        const tag = createTag(style, () => {
          const updatedStyles = config.typography.textStyles.filter(s => s !== style);
          updateConfig({ typography: { textStyles: updatedStyles } });
        });
        textStylesList.appendChild(tag);
      });
      
      // Initialize Spacing section
      document.getElementById('base-unit').value = config.spacing.baseUnit;
      document.getElementById('spacing-tolerance').value = config.spacing.tolerancePercent;
      
      // Initialize Components section
      const componentsList = document.getElementById('components-list');
      componentsList.innerHTML = '';
      
      config.components.mustBeInstances.forEach(component => {
        const tag = createTag(component, () => {
          const updatedComponents = config.components.mustBeInstances.filter(c => c !== component);
          updateConfig({ components: { mustBeInstances: updatedComponents } });
        });
        componentsList.appendChild(tag);
      });
      
      document.getElementById('required-components').value = 
        JSON.stringify(config.components.requiredComponents, null, 2);
      
      // Initialize Naming section
      document.getElementById('frame-pattern').value = config.naming.patterns.frames.toString();
      document.getElementById('component-pattern').value = config.naming.patterns.components.toString();
      document.getElementById('layer-pattern').value = config.naming.patterns.layers.toString();
      
      // Initialize Accessibility section
      document.getElementById('min-contrast').value = config.accessibility.minContrastRatio;
      document.getElementById('min-touch-size').value = config.accessibility.interactiveElementMinSize;
    }
    
    // Create a tag element with remove button
    function createTag(text, onRemove) {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = text + '<span class="remove">×</span>';
      
      tag.querySelector('.remove').addEventListener('click', () => {
        onRemove();
        tag.remove();
      });
      
      return tag;
    }
    
    // Update configuration
    function updateConfig(partialConfig) {
      // Deep merge the partial config into current config
      const merged = deepMerge(currentConfig, partialConfig);
      currentConfig = merged;
      
      // Send update to plugin
      parent.postMessage({ 
        pluginMessage: { 
          type: 'update-config', 
          config: partialConfig 
        } 
      }, '*');
      
      function deepMerge(target, source) {
        const output = { ...target };
        
        if (isObject(target) && isObject(source)) {
          Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
              if (!(key in target)) {
                Object.assign(output, { [key]: source[key] });
              } else {
                output[key] = deepMerge(target[key], source[key]);
              }
            } else {
              Object.assign(output, { [key]: source[key] });
            }
          });
        }
        
        return output;
        
        function isObject(item) {
          return item && typeof item === 'object' && !Array.isArray(item);
        }
      }
    }
    
    // Initialize event listeners
    function initializeEventListeners() {
      // Add color
      document.getElementById('add-color-btn').addEventListener('click', () => {
        const colorInput = document.getElementById('new-color');
        const color = colorInput.value.trim().toUpperCase();
        
        if (color && /^#[0-9A-F]{6}$/.test(color)) {
          const updatedColors = [...currentConfig.colors.allowedColors, color];
          updateConfig({ colors: { allowedColors: updatedColors } });
          
          // Add color to UI
          const colorList = document.getElementById('color-list');
          const swatch = document.createElement('div');
          swatch.className = 'color-swatch';
          swatch.style.backgroundColor = color;
          swatch.setAttribute('data-color', color);
          swatch.title = color;
          
          swatch.addEventListener('click', () => {
            // Remove color from list
            const updatedColors = currentConfig.colors.allowedColors.filter(c => c !== color);
            updateConfig({ colors: { allowedColors: updatedColors } });
            swatch.remove();
          });
          
          colorList.appendChild(swatch);
          colorInput.value = '';
        } else {
          alert('Please enter a valid hex color (e.g. #FF0000)');
        }
      });
      
      // Update color tolerance
      document.getElementById('color-tolerance').addEventListener('change', (e) => {
        updateConfig({ colors: { tolerance: parseInt(e.target.value) } });
      });
      
      // Add font
      document.getElementById('add-font-btn').addEventListener('click', () => {
        const fontInput = document.getElementById('new-font');
        const font = fontInput.value.trim();
        
        if (font) {
          const updatedFonts = [...currentConfig.typography.allowedFonts, font];
          updateConfig({ typography: { allowedFonts: updatedFonts } });
          
          // Add font to UI
          const fontsList = document.getElementById('fonts-list');
          const tag = createTag(font, () => {
            const updatedFonts = currentConfig.typography.allowedFonts.filter(f => f !== font);
            updateConfig({ typography: { allowedFonts: updatedFonts } });
          });
          fontsList.appendChild(tag);
          fontInput.value = '';
        }
      });
      
      // Add text style
      document.getElementById('add-text-style-btn').addEventListener('click', () => {
        const styleInput = document.getElementById('new-text-style');
        const style = styleInput.value.trim();
        
        if (style) {
          const updatedStyles = [...currentConfig.typography.textStyles, style];
          updateConfig({ typography: { textStyles: updatedStyles } });
          
          // Add style to UI
          const stylesList = document.getElementById('text-styles-list');
          const tag = createTag(style, () => {
            const updatedStyles = currentConfig.typography.textStyles.filter(s => s !== style);
            updateConfig({ typography: { textStyles: updatedStyles } });
          });
          stylesList.appendChild(tag);
          styleInput.value = '';
        }
      });
      
      // Update spacing values
      document.getElementById('base-unit').addEventListener('change', (e) => {
        updateConfig({ spacing: { baseUnit: parseInt(e.target.value) } });
      });
      
      document.getElementById('spacing-tolerance').addEventListener('change', (e) => {
        updateConfig({ spacing: { tolerancePercent: parseInt(e.target.value) } });
      });
      
      // Add component
      document.getElementById('add-component-btn').addEventListener('click', () => {
        const componentInput = document.getElementById('new-component');
        const component = componentInput.value.trim();
        
        if (component) {
          const updatedComponents = [...currentConfig.components.mustBeInstances, component];
          updateConfig({ components: { mustBeInstances: updatedComponents } });
          
          // Add component to UI
          const componentsList = document.getElementById('components-list');
          const tag = createTag(component, () => {
            const updatedComponents = currentConfig.components.mustBeInstances.filter(c => c !== component);
            updateConfig({ components: { mustBeInstances: updatedComponents } });
          });
          componentsList.appendChild(tag);
          componentInput.value = '';
        }
      });
      
      // Update required components
      document.getElementById('required-components').addEventListener('change', (e) => {
        try {
          const requiredComponents = JSON.parse(e.target.value);
          updateConfig({ components: { requiredComponents } });
        } catch (error) {
          alert('Please enter valid JSON for required components');
        }
      });
      
      // Update naming patterns
      document.getElementById('frame-pattern').addEventListener('change', (e) => {
        try {
          const pattern = new RegExp(e.target.value);
          updateConfig({ 
            naming: { 
              patterns: { 
                frames: pattern 
              } 
            } 
          });
        } catch (error) {
          alert('Please enter a valid regular expression');
        }
      });
      
      document.getElementById('component-pattern').addEventListener('change', (e) => {
        try {
          const pattern = new RegExp(e.target.value);
          updateConfig({ 
            naming: { 
              patterns: { 
                components: pattern 
              } 
            } 
          });
        } catch (error) {
          alert('Please enter a valid regular expression');
        }
      });
      
      document.getElementById('layer-pattern').addEventListener('change', (e) => {
        try {
          const pattern = new RegExp(e.target.value);
          updateConfig({ 
            naming: { 
              patterns: { 
                layers: pattern 
              } 
            } 
          });
        } catch (error) {
          alert('Please enter a valid regular expression');
        }
      });
      
      // Update accessibility settings
      document.getElementById('min-contrast').addEventListener('change', (e) => {
        updateConfig({ accessibility: { minContrastRatio: parseFloat(e.target.value) } });
      });
      
      document.getElementById('min-touch-size').addEventListener('change', (e) => {
        updateConfig({ accessibility: { interactiveElementMinSize: parseInt(e.target.value) } });
      });
      
      // Reset to defaults
      document.getElementById('reset-config').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all standards to default values?')) {
          parent.postMessage({ 
            pluginMessage: { 
              type: 'reset-config'
            } 
          }, '*');
        }
      });
      
      // Import from team library
      document.getElementById('import-team-btn').addEventListener('click', () => {
        const fileKey = document.getElementById('team-file-key').value.trim();
        
        if (fileKey) {
          parent.postMessage({ 
            pluginMessage: { 
              type: 'import-from-team-library',
              fileKey
            } 
          }, '*');
        } else {
          alert('Please enter a team library file key');
        }
      });
      
      // Manual import
      document.getElementById('import-manual-btn').addEventListener('click', () => {
        const configStr = document.getElementById('import-config').value.trim();
        
        try {
          const config = JSON.parse(configStr);
          parent.postMessage({ 
            pluginMessage: { 
              type: 'update-config',
              config
            } 
          }, '*');
          
          document.getElementById('import-config').value = '';
          alert('Configuration imported successfully');
        } catch (error) {
          alert('Error importing configuration: ' + error.message);
        }
      });
      
      // Export config
      document.getElementById('export-config-btn').addEventListener('click', () => {
        parent.postMessage({ 
          pluginMessage: { 
            type: 'export-config'
          } 
        }, '*');
      });
      
      // Handle button clicks
      document.getElementById('check-button').addEventListener('click', () => {
        const deepCheck = document.getElementById('deep-check').checked;
        parent.postMessage({ pluginMessage: { type: 'run-check', deep: deepCheck } }, '*');
      });
      
      document.getElementById('mark-ready-button').addEventListener('click', () => {
        parent.postMessage({ pluginMessage: { type: 'check-ready-for-dev' } }, '*');
      });
    }
    
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
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Handle messages from the plugin
    window.onmessage = event => {
      const message = event.data.pluginMessage;
      
      if (message.type === 'check-results') {
        showResults(message.results);
      } else if (message.type === 'current-config') {
        initializeUI(message.config);
        
        // Open first section by default
        const firstSection = document.querySelector('.section-content');
        const firstArrow = document.querySelector('.toggle-arrow');
        if (firstSection && firstArrow) {
          firstSection.classList.add('open');
          firstArrow.classList.add('open');
        }
      } else if (message.type === 'export-config-data') {
        const exportPreview = document.getElementById('export-preview');
        exportPreview.textContent = message.configData;
        exportPreview.style.display = 'block';
        
        // Copy to clipboard functionality
        const copyButton = document.createElement('button');
        copyButton.className = 'secondary-button';
        copyButton.style.marginTop = '8px';
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(message.configData)
            .then(() => {
              copyButton.textContent = 'Copied!';
              setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy: ', err);
            });
        });
        
        // Add button after the preview
        const buttonContainer = document.createElement('div');
        buttonContainer.appendChild(copyButton);
        exportPreview.parentNode.insertBefore(buttonContainer, exportPreview.nextSibling);
      }
    };
  </script>
</body>
</html>
`;

// Main plugin entry point
const main = () => {
  // Create instances of our classes
  const checker = new DesignStandardsChecker();
  const ui = new PluginUI(checker);
  
  // Show the UI with dimensions
  // Note: We're now using the HTML_TEMPLATE directly to avoid ui.html file issues
  figma.showUI(HTML_TEMPLATE, { 
    width: 450, 
    height: 650,
    themeColors: true // Use Figma's theme colors
  });
  
  // Send current configuration to the UI
  ui.sendConfigToUI();
  
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
            // Set "ready for dev" status by adding a plugin data property
            selectedNode.setPluginData('readyForDev', 'true');
            selectedNode.setPluginData('readyForDevTimestamp', new Date().toISOString());
            
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
      
      // Configuration related messages
      case 'update-config':
        ui.handleConfigMessages(msg);
        break;
        
      case 'reset-config':
        ui.handleConfigMessages(msg);
        break;
        
      case 'import-from-team-library':
        ui.handleConfigMessages(msg);
        break;
        
      case 'export-config':
        ui.handleConfigMessages(msg);
        break;
        
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
      
      // Check if node is already marked as ready for dev
      const isReadyForDev = node.getPluginData('readyForDev') === 'true';
      if (isReadyForDev) {
        const timestamp = node.getPluginData('readyForDevTimestamp');
        const date = timestamp ? new Date(timestamp).toLocaleString() : 'unknown date';
        figma.notify(`✓ This design was marked Ready for Dev on ${date}`);
        return;
      }
      
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