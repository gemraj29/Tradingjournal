// vite.config.js
import { defineConfig } from "file:///sessions/happy-focused-clarke/mnt/designatradingjournal/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/happy-focused-clarke/mnt/designatradingjournal/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    // Add 'module' so Vite/Rollup resolves react-router v7's ESM exports
    conditions: ["module", "browser", "import", "default"],
    mainFields: ["module", "browser", "main"]
  },
  server: {
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvaGFwcHktZm9jdXNlZC1jbGFya2UvbW50L2Rlc2lnbmF0cmFkaW5nam91cm5hbC9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2hhcHB5LWZvY3VzZWQtY2xhcmtlL21udC9kZXNpZ25hdHJhZGluZ2pvdXJuYWwvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2hhcHB5LWZvY3VzZWQtY2xhcmtlL21udC9kZXNpZ25hdHJhZGluZ2pvdXJuYWwvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICAvLyBBZGQgJ21vZHVsZScgc28gVml0ZS9Sb2xsdXAgcmVzb2x2ZXMgcmVhY3Qtcm91dGVyIHY3J3MgRVNNIGV4cG9ydHNcbiAgICBjb25kaXRpb25zOiBbJ21vZHVsZScsICdicm93c2VyJywgJ2ltcG9ydCcsICdkZWZhdWx0J10sXG4gICAgbWFpbkZpZWxkczogWydtb2R1bGUnLCAnYnJvd3NlcicsICdtYWluJ10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwKSA9PiBwLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxWCxTQUFTLG9CQUFvQjtBQUNsWixPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQTtBQUFBLElBRVAsWUFBWSxDQUFDLFVBQVUsV0FBVyxVQUFVLFNBQVM7QUFBQSxJQUNyRCxZQUFZLENBQUMsVUFBVSxXQUFXLE1BQU07QUFBQSxFQUMxQztBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
