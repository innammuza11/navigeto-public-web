The Sri Lanka map release was based on the source preceding the theme and
public booking/enquiry releases. This recovery merges the previously published
release through PR42 into the map source, preserving both commit histories.
The three conflicts retain the newer theme/navigation/tour catalogue behavior;
the TourResults exploration slot retains the interactive map.

Public-site deployments must use navigeto-public-web current main, not the
TravelOS public-web copy or a stale feature branch. Before a release, fetch main
with an explicit remote ref and require a clean checkout at that exact commit.
Review the candidate homepage, artwork, hotel/visa catalogues, tour detail and
map before restoring the candidate deploy to production. Keep production locked
and preserve the previously published deploy ID for rollback.
