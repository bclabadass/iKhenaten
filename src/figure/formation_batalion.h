#pragma once

#include "building/building.h"
#include "figure/formation.h"


bool formation_batalion_recruits_needed();

void formation_batalion_update_recruit_status(building* fort);
void formation_batalion_gain_engagement_experience(formation* m);

void formation_batalion_change_layout(formation* m, e_formation_layout new_layout);

void formation_batalion_restore_layout(formation* m);

e_formation_layout formation_batalion_line_layout(e_formation_layout layout, int direction);

void formation_batalion_rotate(formation* m);

void formation_batalion_move_to(formation* m, tile2i tile);

void formation_batalion_return_home(formation* m);

int formation_batalion_curse();

formation_id formation_batalion_at(tile2i tile);

int formation_batalion_at_building(int grid_offset);

void formation_batalion_decrease_damage();