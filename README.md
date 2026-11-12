# ZeManyo / Manyeyo Quarshie Photography Website

Static photography portfolio deployed on Netlify. Gallery images are uploaded to Cloudinary and gallery metadata is stored in Netlify Blobs.

## Netlify environment variable

In **Netlify → Project configuration → Environment variables**, configure the secret with this exact key:

- `Password_admin` — a strong, unique password for the website admin panel.

The key name is case-sensitive and must match the Netlify Functions. The password value is verified server-side; it is not stored in browser local storage or in this repository. Keep the value private. Redeploy after adding or changing it.

## Cloudinary setup

In the admin panel, enter the Cloudinary cloud name and an unsigned upload preset. Configure the preset in Cloudinary to:

- Allow image uploads only.
- Restrict allowed formats to JPEG, PNG, WebP, and optionally GIF.
- Set a maximum upload size consistent with the website's 10 MB per-file limit.
- Use a dedicated folder for each upload stream if supported. Photography uploads use `portfolio`; modelling uploads use `modelling-portfolio`.
- Avoid allowing arbitrary transformations or other resource types unless required.

The Cloudinary cloud name and unsigned preset are stored in the current browser because the browser uploads directly to Cloudinary. They are not authentication secrets, but an unsigned preset can be abused if configured too permissively. Restrict it in Cloudinary.

## Deploy

1. Push the project files to the GitHub repository connected to Netlify.
2. Confirm the Netlify site is linked to the correct repository and production branch.
3. Confirm `Password_admin` is configured for the Production deploy context and Functions scope.
4. Trigger a fresh deploy.
5. Test the photography gallery, modelling portfolio, admin sign-in, both upload managers, caption/brand/category edits, image ordering, deletion, and contact form.

Netlify Blobs must be available to the deployed site. The first successful gallery save creates/updates the `gallery` store.

## Important notes

- Gallery deletion removes the image reference from the website but does not delete the original Cloudinary asset. Delete unused assets separately in Cloudinary if needed.
- The first item in the photography gallery is treated as the lead/hero image by the existing website design. The modelling portfolio is stored separately under the `modelling-images` key in the same Netlify Blobs `gallery` store.
- Modelling portfolio API routes are `/api/get-modelling` (public read) and `/api/save-modelling` (admin-authenticated write). Modelling uploads and management are separate from photography gallery uploads and management.
- Modelling entries support a caption, optional brand/product name, and one of four categories: product, brand, lifestyle, or editorial. Visitors can filter the public modelling portfolio by category.
- Admin authentication is server-verified. The password remains in memory in the admin browser tab only while that page is open and is sent over HTTPS to the same-origin authentication/save endpoints.
- Set a strong password and rotate it if it has ever been shared or committed to GitHub.
- The inquiry form uses Netlify Forms. Verify that form detection is enabled after deployment and submit a real test inquiry.

## Owner details updated

- Instagram: `@_manyeyo`
- Snapchat: `backtobackhater`
- Pinterest: `adwoamanyeyo`
- Public email: `quarshieemmanuella@gmail.com`
- Location: Accra and Akosombo, Ghana; available to travel.
- Photography experience wording: two years.
- About section also mentions a love of creating memories through collages.
- Testimonial area identifies the Osei-Poku Family as a family feature; no fabricated direct quotation is attributed to them.

## Modelling portfolio

The site now includes a dedicated Modelling section with its own public gallery, category filters, and image lightbox. In the Site Admin panel, use **Modelling Portfolio Manager** to upload and manage modelling photographs independently of the photography gallery. Each upload prompts for a short caption, optional brand/product name, and category. The same Cloudinary cloud name and unsigned upload preset are used for both upload areas; the modelling uploads are placed in the `modelling-portfolio` folder.
