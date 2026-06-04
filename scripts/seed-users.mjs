// Rodar UMA VEZ: node scripts/seed-users.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nanbwqkmqpsthostdxgg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmJ3cWttcXBzdGhvc3RkeGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTM2MzMsImV4cCI6MjA5NjE2OTYzM30.60-FCuYnZytB05oA5USRBdzu8LD808_pCrxTbbBULuw";

const users = [
  { username: "minerva",  password: "minerva123"  },
  { username: "levi",     password: "levi123"     },
  { username: "tia",      password: "tia123"      },
  { username: "saske",    password: "saske123"    },
  { username: "sorriso",  password: "sorriso123"  },
  { username: "mel",      password: "mel123"      },
  { username: "lua",      password: "lua123"      },
];

function usernameToEmail(username) {
  return `${username.toLowerCase()}@lolbronzequiz.gg`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Criando usuários...\n");

for (const user of users) {
  const email = usernameToEmail(user.username);
  const { error } = await supabase.auth.signUp({
    email,
    password: user.password,
    options: { data: { username: user.username } },
  });

  if (error) {
    console.log(`❌ ${user.username}: ${error.message}`);
  } else {
    console.log(`✅ ${user.username} | senha: ${user.password}`);
  }

  // Pequena pausa para não bater rate limit
  await new Promise((r) => setTimeout(r, 600));
}

console.log("\nPronto! Guarde as senhas:");
users.forEach((u) => console.log(`  ${u.username.padEnd(10)} → ${u.password}`));
