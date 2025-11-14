import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    route('/admin/jobs', 'routes/admin/jobs.tsx'),
    route('/admin/make-admin', 'routes/admin/make-admin.tsx'),
] satisfies RouteConfig;
 