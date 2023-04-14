import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { execSync } from "child_process";
dotenv.config();

const opts = () => ({
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

const publishToRoamDepot = async ({
  owner = process.env.GITHUB_REPOSITORY_OWNER,
  repo = path.basename(process.cwd()),
  branch = repo,
  proxy = owner,
}: {
  repo?: string;
  owner?: string;
  branch?: string;
  proxy?: string;
}) => {
  console.log("Attempting to publish to Roam Depot...");
  const pr = await axios
    .get(
      `https://api.github.com/repos/Roam-Research/roam-depot/pulls?head=${owner}:${branch}`,
      opts()
    )
    .then((r) => r.data[0]?.html_url);
  const cwd = process.cwd();
  process.chdir("/tmp");
  execSync(
    `git clone https://${owner}:${process.env.GITHUB_TOKEN}@github.com/${owner}/roam-depot.git`,
    { stdio: "inherit" }
  );
  process.chdir("roam-depot");
  const manifestFile = `extensions/${proxy}/${repo.replace(
    /^roam(js)?-/,
    ""
  )}.json`;
  const packageJson = JSON.parse(
    fs.readFileSync(`${cwd}/package.json`).toString()
  );
  const { name: authorName, email: authorEmail } = await axios
    .get<{ name: string; email: string }>(`https://api.github.com/user`, opts())
    .then((r) => r.data)
    .catch(() => packageJson.author || {});
  execSync(`git config --global user.email "${authorEmail}"`, {
    stdio: "inherit",
  });
  execSync(`git config --global user.name "${authorName}"`, {
    stdio: "inherit",
  });
  execSync(`git remote add roam https://github.com/Roam-Research/roam-depot`, {
    stdio: "inherit",
  });
  execSync(`git pull roam main --rebase`, { stdio: "inherit" });
  execSync(`git push origin main -f`, { stdio: "inherit" });
  if (pr) {
    console.log("Found existing PR");
    execSync(`git checkout ${branch}`, { stdio: "inherit" });
    execSync(`git rebase origin/main`, { stdio: "inherit" });
    const manifest = fs.readFileSync(manifestFile).toString();
    fs.writeFileSync(
      manifestFile,
      manifest.replace(
        /"source_commit": "[a-f0-9]+",/,
        `"source_commit": "${process.env.GITHUB_SHA}",`
      )
    );
    console.log(
      "Editing",
      manifestFile,
      "from",
      manifest,
      "to",
      process.env.GITHUB_SHA
    );
    execSync("git add --all", { stdio: "inherit" });
    execSync(`git commit -m "Version ${packageJson.version}"`, {
      stdio: "inherit",
    });
    execSync(`git push origin ${branch} -f`, { stdio: "inherit" });
    console.log(`Updated pull request: ${pr}`);
  } else {
    console.log("Creating new PR");
    execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
    if (!fs.existsSync(`extensions/${proxy}`))
      fs.mkdirSync(`extensions/${proxy}`);
    const name = repo
      .replace(/^roam(js)?-/, "")
      .split("-")
      .map((s) => `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`)
      .join(" ");
    if (fs.existsSync(manifestFile)) {
      const manifest = fs.readFileSync(manifestFile).toString();
      fs.writeFileSync(
        manifestFile,
        manifest.replace(
          /"source_commit": "[a-f0-9]+",/,
          `"source_commit": "${process.env.GITHUB_SHA}",`
        )
      );
    } else {
      fs.writeFileSync(
        manifestFile,
        JSON.stringify(
          {
            name,
            short_description:
              packageJson?.description ||
              "Description missing from package json",
            author: authorName,
            tags: packageJson?.tags || [],
            source_url: `https://github.com/${owner}/${repo}`,
            source_repo: `https://github.com/${owner}/${repo}.git`,
            source_commit: process.env.GITHUB_SHA,
            stripe_account: packageJson.stripe,
          },
          null,
          4
        ) + "\n"
      );
    }
    const title = `${name}: Version ${packageJson.version}`;
    execSync("git add --all", { stdio: "inherit" });
    execSync(`git commit -m "${title}"`, { stdio: "inherit" });
    execSync(`git push origin ${branch} -f`, { stdio: "inherit" });
    const url = await axios
      .post(
        `https://api.github.com/repos/Roam-Research/roam-depot/pulls`,
        {
          head: `${owner}:${branch}`,
          base: "main",
          title,
        },
        opts()
      )
      .then((r) => r.data.html_url)
      .catch((e) => Promise.reject(e.response.data || e.message));
    console.log(`Created pull request: ${url}`);
  }
  process.chdir(cwd);
};

export default publishToRoamDepot;
