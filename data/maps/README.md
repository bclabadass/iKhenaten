# Campaign mission maps

Shipped `FILE_FORMAT_MAP_FILE` maps for campaign scenarios (terrain, image,
elevation, moisture, fertility, vegetation, scenario_info, empire blobs, …).

Naming matches `src/scripts/mission/m_NNN_*.js` (scenarios **0–52**).

Each campaign mission sets `map_file : "data/maps/m_NNN_….map"`.
`GamestateIO::load_mission` loads that map; the maps carry no buildings. The
buildings a mission starts with (Thinis' temple complex and mansion, Byblos'
town, ...) come from the mission's entry in the original `mission1.pak` (a save
of the mission's first day), when the install has it and the entry is v149 or
later (`og::load_mission_start`). Custom Cleopatra maps (ids 128+) use Cleop `Maps/` via
`__game_load_map`, not this folder.

Deployed at build time to `<binary>/Data/maps` (MSVC) or `<binary>/data/maps`.
