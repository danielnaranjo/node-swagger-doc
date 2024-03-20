import axios from "axios";
import fs from 'fs';

let content = '';
axios
  .get("http://localhost:9207/api-docs.json")
  .then((response) => {

    const raw = response.data;
    content += `# ${raw.info.title} - ${raw.info.version}\n`;
    content += `${raw.info.description} \n`;

    content += `### Server\n`;
    content += `Base URL: **${raw.host}** \n`;
    content += `Content-type: **${raw.produces.join(',')}** \n`;
    content += `Support: **${raw.schemes.join(',')}** \n`;
    content += `Secure: ${raw.securityDefinitions.JWT.description} \n`;

    content += `### Sections \n`;
    content += `| Name        | Description | Link | \n`;
    content += `| ----------- | ----------- | -- | \n`;
    for (let tag of raw.tags) {
      content += `| ${tag.name.toUpperCase()} | ${tag.description} | [Link]()\n`;
    };
    content += ` \n`;
    content += `### Routes \n`;
    for (const [key, value] of Object.entries(raw.paths)) {
      content += ` \n`;
      content += `***${raw.schemes[1]}://${raw.host}${key}*** \n`;
      for (const [k, v] of Object.entries(value)) {
        content += `${v.description}\n`;        
        content += '```  \n';
        content += `curl -X ${k.toUpperCase()} "${raw.schemes[1]}://${raw.host}${key}" -H "accept: ${raw.produces}" -H "${raw.securityDefinitions.JWT.name}: Bearer abcdef12345" \n`;
        for (let p of v.parameters) {
          const field = JSON.parse(JSON.stringify(p));

          if (k == 'post' || k == 'put') {
            content += ' -d "{ ';
            content += ' "' + field.name + '" : "' + field.name + '" ';
            content += ' }" \n';
          }
        }
        content += '```  \n';
        content += ` \n`;
      };
    };
   
    delete raw.info;
    delete raw.tags;
    delete raw.securityDefinitions;
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    const generated = new Date();
    content += `\n\n\n\n`;
    content += `Generated by [Daniel Naranjo]() on ${generated} \n`;
    fs.writeFileSync(`swagger-${generated.getTime()}.md`, content);
  });
