#Arenas

Arenas use rects to do their logic, in order to parse it 
appropriately you need to name things properly.
Example:
Scene1Arena3Trigger1
This would be a part of scene 1, Arena number 3, and the last one is the unique numeric ID.
The last number must be 1-n with no empty entries.

There is also destructable ones that require the trigger editor.
It works the same way but must have Dest_ at the start.
**Dest_Scene#Arena#Entry#**
You must then go into InitScene# and set said variable to make sure its not null.

## Combat Arena:
###Regions/Rects
* **Scene#Arena#Trigger#** - Triggers are what regions the player interact with to start the encounter.
* **Scene#Arena#Tardy#** - If a hero is not inside the arena, they will be moved to these.
* **Scene#Arena#Check#** - Check, or "arenaCheck" is the rects that define the arena bounds.
* **Scene#Arena#Spawn#** - Enemy/Thing SpawnPoint

###Destructables
* **Dest_Scene#Arena#Entry#** - Entrances to an arena, for closing/opening/etc.
* **Dest_Scene#Arena#Exit#** - Exits of an arena, for closing/opening/etc.
