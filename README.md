# KickScripts
A screeps inspired football simulation game.

## 1. Introduction

This is just a prototype / proof of concept.

I enjoyed playing Screeps for a while, but i'm not much of an RTS player. That's why i wanted to recreate the screeps experience with a game type that i'm more experienced with. My 1000+ hours logged in football manager kind of made the decision for me.

Some code concepts and variable names are outright copied from Screeps. Having played a lot of Screeps lately these patterns make more sense to me, thus they're easier to work with.

e.g. Game object, Player/Creep object with prototype methods like moveTo() and tackle(), OUT_OF_RANGE error code, module.exports loops.

There isn't much of an interface. Just a very simple textual representation of the field matrix that is printed out each round.

## 2. Running the demo

cd kickscripts

node ks.js


## 3. Example output


    .        .        .        .        P        .        K       .        P        .        .        .        .    


    .        .        .        D        .        .        D        .        .        D        .        .        .    


    .        .        .        .        .        .        .        .        .        .        .        .        .    


    .        M        .        .        .        .        M        .        .        .        .        M        .    


    .        .        .        .        .        .        .        .        .        .        .        .        .    


    .        .        .        .        S        .        .        .        S        .        .        .        .    


    .        .        .        .        .        .        .        .        .        .        .        .        .    


    .        .        .        .        S        .        .        .        S        .        .        .        .    


    .        .        .        .        .        .        B        .        .        .        .        .        .    


    .        M        .        .        .        .        M        .        .        .        .        M        .    


    .        .        .        .        .        .        .        .        .        .        .        .        .    


    .        .        .        D        .        .        D        .        .        D        .        .        .    


    .        .        .        .        P        .        K       .        P        .        .        .        .    

