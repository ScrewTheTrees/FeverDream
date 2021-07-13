#Arenas

Arenas use rects to do their logic, in order to parse it 
appropriately you need to name things properly.
Example:
Arena3Trigger1
This would be a part of Arena 3, and the last one is the unique numeric ID.
The last number must be 1-n with no empty entries.

There is also destructable ones that require the trigger editor.
It works the same way but must have Dest_ at the start.
**Dest_Arena#Entry#**
You must then go into Init and set said variable to make sure its not null.

## Combat Arena:
###Regions/Rects
* **Arena#Trigger#** - Triggers are what regions the player interact with to start the encounter.
* **Arena#Tardy#** - If a hero is not inside the arena, they will be moved to these.
* **Arena#Check#** - Check, or "arenaCheck" is the rects that define the arena bounds.
* **Arena#Spawn#** - Enemy/Thing SpawnPoint

###Destructables
* **Dest_Arena#Entry#** - Entrances to an arena, for closing/opening/etc.
* **Dest_Arena#Exit#** - Exits of an arena, for closing/opening/etc.
