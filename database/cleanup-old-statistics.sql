-- Optional operator cleanup of visit data older than the 90-day reporting window.
DELETE FROM code_visits WHERE visited_at < now() - interval '90 days';
