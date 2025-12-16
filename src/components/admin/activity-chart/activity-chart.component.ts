import { Component, ChangeDetectionStrategy, input, ElementRef, AfterViewInit, viewChild, effect } from '@angular/core';

// Declare d3 to avoid TypeScript errors since it's loaded from a script tag
declare var d3: any;

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [],
  templateUrl: './activity-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChartComponent implements AfterViewInit {
  chartData = input.required<{ labels: string[]; data: number[] }>();
  resourceName = input.required<string>();
  
  chartContainer = viewChild<ElementRef>('chartContainer');

  private isInitialized = false;

  constructor() {
    effect(() => {
      // Redraw chart if data changes after initial render
      if (this.isInitialized && this.chartContainer() && this.chartData().labels.length > 0) {
        this.createChart();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.chartData().labels.length > 0) {
      this.createChart();
      this.isInitialized = true;
    }
  }

  private createChart(): void {
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;
    
    // Clear previous chart to prevent duplication on redraw
    d3.select(element).select('svg').remove(); 

    const data = this.chartData().data;
    const labels = this.chartData().labels;
    
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${element.clientWidth} ${350}`)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(labels)
      .padding(0.3);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('class', 'text-xs text-slate-600');
        
    // Y axis
    const maxY = d3.max(data) || 5;
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y).ticks(Math.min(maxY, 5)).tickFormat(d3.format('d')))
      .selectAll('text')
        .attr('class', 'text-xs text-slate-600');
        
    // Bars
    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', (d: number, i: number) => x(labels[i]) as number)
        .attr('y', (d: number) => y(d))
        .attr('width', x.bandwidth())
        .attr('height', 0) // Start with height 0 for animation
        .attr('fill', '#4f46e5') // Indigo-600 color from Tailwind
        .attr('rx', 4) // Rounded corners
      .transition()
        .duration(800)
        .attr('height', (d: number) => height - y(d))
        .delay((d: number, i: number) => i * 50);

    // Add Y-axis grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
          .ticks(Math.min(maxY, 5))
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
        .attr('stroke', '#e2e8f0'); // slate-200

    // Remove the domain line from grid
    d3.select('.grid path').remove();
  }
}
