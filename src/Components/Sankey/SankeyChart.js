import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import Node from "./Node";
import Link from "./Link";

const SankeyChart = ({ jobs, statusColors }) => {
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
          (l) =>
            l.source === i &&
            l.target === i + 1
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
          (l) =>
            l.source === maxStatusIndex &&
            l.target === rejectedIndex
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

  return (
    <ResponsiveContainer width="100%" height={500}>
<Sankey
      width={960}
      height={900}
      margin={{ top: 20, bottom: 20 }}
      data={generateSankeyData(jobs)}
      nodeWidth={10}
      nodePadding={100} 
      linkCurvature={0.61}
      iterations={64}
      link={<Link />}
      node={<Node containerWidth={960} />}
    >
      <defs>
        <linearGradient id={"linkGradient"}>
          <stop offset="0%" stopColor="rgba(0, 136, 254, 0.5)" />
          <stop offset="100%" stopColor="rgba(0, 197, 159, 0.3)" />
        </linearGradient>
      </defs>
      <Tooltip />
    </Sankey>

    </ResponsiveContainer>
  );
};

export default SankeyChart;
