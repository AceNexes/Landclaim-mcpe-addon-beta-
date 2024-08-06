import { world } from "@minecraft/server";

let pos1 = null;
let pos2 = null;
let player = null;

// Event listener for breaking blocks
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    let posx = event.block.x;
    let posy = event.block.y;
    let posz = event.block.z;
    const pos = [posx, posy, posz];
    let source = event.player;

    // If the item is a land claim item
    if (event.itemStack && event.itemStack.typeId === "kai:landclaim") {
        if (pos1 === null) {
            event.cancel = true;
            pos1 = pos;
            world.sendMessage("Position 1 set");
        } else if (pos2 === null) {
            event.cancel = true;
            player = source.name;
            pos2 = pos;
            world.sendMessage("Position 2 set");
        } else {
            world.sendMessage("All positions set");
            event.cancel = true;
        }
    } else {
        // Check if we have both positions set
        if (pos1 && pos2) {
            // Extract min and max coordinates from pos1 and pos2
            let [x1, y1, z1] = pos1;
            let [x2, y2, z2] = pos2;

            // Ensure x1 < x2, y1 < y2, and z1 < z2 for proper bounding box calculations
            let minX = Math.min(x1, x2);
            let maxX = Math.max(x1, x2);
            let minY = Math.min(y1, y2);
            let maxY = minY + 120;
            let minZ = Math.min(z1, z2);
            let maxZ = Math.max(x1, x2);

            // Check if the block position is within the protected area
            if (posx >= minX && posx <= maxX && posy >= minY && posy <= maxY && posz >= minZ && posz <= maxZ) {
                // Allow block breaking only if the player is the one who set the area
                if (player === event.player.name) {
                    // Allow breaking the block
                } else {
                    world.sendMessage("You can't break blocks here");
                    event.cancel = true;
                }
            } else {
                // Outside the protected area
                world.sendMessage("You can't break blocks here");
                event.cancel = true;
            }
        } else {
            // No positions set, make everything unbreakable
            event.cancel = true;
        }
    }

    // Reset positions with compass
    if (event.itemStack && event.itemStack.typeId === "minecraft:compass") {
        pos1 = null;
        pos2 = null;
        player = null;
        world.sendMessage("Positions reset");
    }
});

// Event listener for placing blocks
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    let posx = event.block.x;
    let posy = event.block.y;
    let posz = event.block.z;

    if (pos1 && pos2) {
        // Extract min and max coordinates from pos1 and pos2
        let [x1, y1, z1] = pos1;
        let [x2, y2, z2] = pos2;

        // Ensure x1 < x2, y1 < y2, and z1 < z2 for proper bounding box calculations
        let minX = Math.min(x1, x2);
        let maxX = Math.max(x1, x2);
        let minY = Math.min(y1, y2);
        let maxY = minY + 120;
        let minZ = Math.min(z1, z2);
        let maxZ = Math.max(z1, z2);

        // Check if the block position is within the protected area
        if (posx >= minX && posx <= maxX && posy >= minY && posy <= maxY && posz >= minZ && posz <= maxZ) {
            // Allow block placement only if the player is the one who set the area
            if (player === event.player.name) {
                // Allow placing the block
            } else {
                world.sendMessage("You can't place blocks here");
                event.cancel = true;
            }
        } else {
            // Outside the protected area
            world.sendMessage("You can't place blocks here");
            event.cancel = true;
        }
    } else {
        // No positions set, make everything unplaceable
        event.cancel = true;
    }
});
