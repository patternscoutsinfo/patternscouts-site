/* =====================================================================
   PatternScouts  --  the only file on the website you ever need to edit.

   The anon key is safe to publish. It cannot read a licence, a customer
   or an email address. The only two functions it is allowed to call are
   ps_catalogue() and ps_product(), and both of them return nothing but
   the price list. Everything else in the database is closed to it.
   ===================================================================== */

window.PS = {
  SUPABASE_URL: "https://yetrkxtiwbajckynyssw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHJreHRpd2JhamNreW55c3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDk1NTgsImV4cCI6MjEwMTgyNTU1OH0.JFC-iE8xtRB4Cg642sRi5-Jaf0r7p9NiTNdyMdTu7lA",

  // Where the "request a key" form posts. Crow's existing edge function.
  REQUEST_PATH: "/functions/v1/crow-request"
};
