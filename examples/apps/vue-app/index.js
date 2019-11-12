import "./hello.module.css";
import "./hello.jpg";
import "./hello.css";
// import hello from "./hello.vue";

function decor() {
  return function(com) {
    return com;
  };
}

class Abc {
  constructor() {
    console.log("class Abc");
  }
}

new Abc();

import React from "react";

import Vue from "vue";

new Vue();

React.createElement("div");
