import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyChart2 = ({ jobs, statusColors }) => {
  const generateSankeyData = (jobs) => {
    const statusOrder = [
      "Applied",
      "HR Interview",
      "Hiring Manager Interview",
      "Peer Interviews",
      "Offer",
      "Rejected",
    ];

    const nodes = statusOrder.map((status) => ({ name: status }));
    const links = [];

    jobs.forEach((job) => {
      const maxStatusIndex = statusOrder.indexOf(job.maxStatus);
      const currentStatusIndex = statusOrder.indexOf(job.status);

      if (maxStatusIndex < 0 || currentStatusIndex < 0) return;

      for (let i = 0; i < maxStatusIndex; i++) {
        let link = links.find(
          (l) => l.source === i && l.target === i + 1
        );
        if (!link) {
          link = { source: i, target: i + 1, value: 0 };
          links.push(link);
        }
        link.value += 1;
      }

      if (job.status === "Rejected") {
        const rejectedIndex = statusOrder.indexOf("Rejected");
        let link = links.find(
          (l) => l.source === maxStatusIndex && l.target === rejectedIndex
        );
        if (!link) {
          link = { source: maxStatusIndex, target: rejectedIndex, value: 0 };
          links.push(link);
        }
        link.value += 1;
      }
    });

    
    return { nodes, links };
  };

  const svgRef = useRef();

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    const width = 1000;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, width, height]);

    const { nodes, links } = generateSankeyData(jobs);

    const sankeyGen = sankey()
      .nodeWidth(20)
      .nodePadding(100) // increased padding to spread nodes
      .extent([[10, 20], [width - 10, height - 20]]); // top/bottom padding

    const sankeyData = sankeyGen({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    });

    // Default color palette
    const fallbackColors = d3.scaleOrdinal()
      .domain(nodes.map(d => d.name))
      .range([
        '#edf6ff',
        '#ffd966',
        '#e69138',
        '#8eafc9',
        '#4aeb27',
        '#f44336', // highlight
      ]);

    svg.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#000')
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('opacity', 0.1);

    const node = svg.append('g')
      .selectAll('g')
      .data(sankeyData.nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    node.append('rect')
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => fallbackColors(d.name));

    node.append('text')
      .attr('x', -6)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(d => `${d.name} (${d.value})`)
      .style('font-size', 12);

  }, [jobs, statusColors]);

  return <svg ref={svgRef} width="100%" height="500" />;
};

export default SankeyChart2;
