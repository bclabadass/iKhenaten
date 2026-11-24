#pragma once

#include "grid/point.h"

void map_orientation_change(int counter_clockwise);

int map_orientation_for_gatehouse(int x, int y);

int map_orientation_for_triumphal_arch(int x, int y);

void map_orientation_update_buildings(void);

enum e_venue_mode_orientation {
    e_venue_mode_booth,
    e_venue_mode_bandstand,
    e_venue_mode_pavilion,
    e_venue_mode_festival_square,
};

bool map_orientation_for_venue(int x, int y, e_venue_mode_orientation mode, int* building_orientation);
bool map_orientation_for_venue_with_map_orientation(tile2i tile, e_venue_mode_orientation mode, int* building_orientation);

int map_venue_orient_to_view(int map_orientation);
bool map_venue_ghost_orientation(tile2i tile, e_venue_mode_orientation mode, int* view_orientation);

int map_view_orientation();
void map_view_orientation_set(int orientation);
int map_view_relative_orientation(int orientation_absolute);
int map_view_absolute_orientation(int orientation_relative);

// How near the camera a tile is in the current view (larger is nearer).
int map_view_tile_depth(tile2i tile);
// The tile a size x size picture is anchored on in the current view (as map_building_tiles_add marks it).
tile2i map_view_draw_tile(tile2i tile, int size);
