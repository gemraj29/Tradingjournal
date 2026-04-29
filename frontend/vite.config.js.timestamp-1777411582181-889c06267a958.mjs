// vite.config.js
import { defineConfig } from "file:///sessions/happy-focused-clarke/mnt/designatradingjournal/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/happy-focused-clarke/mnt/designatradingjournal/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["module", "import", "default"],
    alias: {
      "react-router": "/sessions/happy-focused-clarke/mnt/designatradingjournal/frontend/node_modules/react-router/dist/development/index.mjs"
    }
  },
  optimizeDeps: {
    include: ["react-router-dom", "recharts", "date-fns"],
    esbuildOptions: {
      conditions: ["module", "import", "default"]
    }
  },
  server: {
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvaGFwcHktZm9jdXNlZC1jbGFya2UvbW50L2Rlc2lnbmF0cmFkaW5nam91cm5hbC9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2hhcHB5LWZvY3VzZWQtY2xhcmtlL21udC9kZXNpZ25hdHJhZGluZ2pvdXJuYWwvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2hhcHB5LWZvY3VzZWQtY2xhcmtlL21udC9kZXNpZ25hdHJhZGluZ2pvdXJuYWwvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBjb25kaXRpb25zOiBbJ21vZHVsZScsICdpbXBvcnQnLCAnZGVmYXVsdCddLFxuICAgIGFsaWFzOiB7XG4gICAgICAncmVhY3Qtcm91dGVyJzogJy9zZXNzaW9ucy9oYXBweS1mb2N1c2VkLWNsYXJrZS9tbnQvZGVzaWduYXRyYWRpbmdqb3VybmFsL2Zyb250ZW5kL25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXIvZGlzdC9kZXZlbG9wbWVudC9pbmRleC5tanMnLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncmVhY3Qtcm91dGVyLWRvbScsICdyZWNoYXJ0cycsICdkYXRlLWZucyddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBjb25kaXRpb25zOiBbJ21vZHVsZScsICdpbXBvcnQnLCAnZGVmYXVsdCddLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxWCxTQUFTLG9CQUFvQjtBQUNsWixPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLFlBQVksQ0FBQyxVQUFVLFVBQVUsU0FBUztBQUFBLElBQzFDLE9BQU87QUFBQSxNQUNMLGdCQUFnQjtBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLG9CQUFvQixZQUFZLFVBQVU7QUFBQSxJQUNwRCxnQkFBZ0I7QUFBQSxNQUNkLFlBQVksQ0FBQyxVQUFVLFVBQVUsU0FBUztBQUFBLElBQzVDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQzlDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
