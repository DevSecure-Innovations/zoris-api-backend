module.exports = {
	apps: [
		{
			name: "zoris-backend",
			script: "src/server.ts",         
			interpreter: "bun",         
			watch: true,                
			env: {
				NODE_ENV: "development",
				PORT: 5000
			},
			env_production: {
				NODE_ENV: "production",
				PORT: 5000
			}
		}
	]
};
