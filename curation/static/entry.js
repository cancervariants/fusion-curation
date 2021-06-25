/* TODO 
    * submission function 
    * refactor
    * record successive divs in tree for recursive hiding
*/

function handleYesNoEvent(yes_name, no_name) {
  return function (event) {
    let selection = event.target.value;
    let yes_div = document.getElementById(`div-${yes_name}`);
    let no_div = document.getElementById(`div-${no_name}`);

    if (selection == "yes") {
      yes_div.style.display = "contents";
      no_div.style.display = "none";
    } else if (selection == "no") {
      yes_div.style.display = "none";
      no_div.style.display = "contents";
    } else {
      yes_div.style.display = "none";
      no_div.style.display = "none";
    }
  }
}

function handleRearrange(event) {
  let selection = event.target.value;
  if (selection == "yes") {
    document.getElementById("div-record-reg").style.display = "contents";
    document.getElementById("div-submit-button").style.display = "contents";
    document.getElementById("div-not-fusion").style.display = "none";
  } else if (selection == "no") {
    document.getElementById("div-record-reg").style.display = "none";
    document.getElementById("div-submit-button").style.display = "none";
    document.getElementById("div-not-fusion").style.display = "contents";
  } else {
    document.getElementById("div-record-reg").style.display = "none";
    document.getElementById("div-submit-button").style.display = "none";
    document.getElementById("div-not-fusion").style.display = "none";
  }
}

function handleSelectProteinCoding(event) {
  let selection = event.target.value;
  if (selection == "yes") {
    document.getElementById("div-rf-preserved").style.display = "contents";
    document.getElementById("div-causative").style.display = "none";
  } else if (selection == "no" || selection == "unknown") {
    document.getElementById("div-rf-preserved").style.display = "none";
    document.getElementById("div-causative").style.display = "contents";
  } else {
    document.getElementById("div-rf-preserved").style.display = "none";
    document.getElementById("div-causative").style.display = "none";
  }
}

function handleReadFramePreserved(event) {
  let selection = event.target.value;
  if (selection == "yes") {
    document.getElementById("div-preserved-domains").style.display = "contents";
    document.getElementById("div-causative").style.display = "contents";
  } else if (selection == "no") {
    document.getElementById("div-preserved-domains").style.display = "none";
    document.getElementById("div-causative").style.display = "contents";
  } else {
    document.getElementById("div-preserved-domains").style.display = "none";
    document.getElementById("div-causative").style.display = "none";
  }
}

function handleCausativeEvent(event) {
  let selection = event.target.value;
  if (selection == "yes") {
    document.getElementById("event-type-group").style.display = "contents";
    // what goes here?  
  } else if (selection == "no") {
    // what goes here?
    document.getElementById("event-type-group").style.display = "contents";
  } else {
    document.getElementById("event-type-group").style.display = "none";
    // what goes here?
  }
}

function handleAlsoRearrange(event) {
  let selection = event.target.value;
  if (selection == "yes") {
    document.getElementById("div-record-reg").style.display = "contents";
    document.getElementById("div-submit-button").style.display = "contents";
  } else if (selection == "no") {
    document.getElementById("div-record-reg").style.display = "none";
    document.getElementById("div-submit-button").style.display = "contents";
  } else {
    document.getElementById("div-record-reg").style.display = "none";
    document.getElementById("div-submit-button").style.display = "none";
  }
}

function handleSubmit(event) {
  let output = {};
  if (document.getElementById("select-chimeric").value == "yes") {
    if (document.getElementById("select-protein-coding").value == "yes") {
      if (document.getElementById("select-rf-preserved").value == "yes") {
        output.rf_preserved = true;
        let retained_domain = {};
        retained_domain.name = document.getElementById("input-preserved-domains").value;
        retained_domain.gene = { "symbol": document.getElementById("input-preserved-genes").value };
        output.retained_domains = [retained_domain];
      } else {
        output.rf_preserved = false;
      }
    }
    // TODO how to handle unknown if protein coding?

    let junct_5_prime_end = {
      "transcript": document.getElementById("input-5-prime-tr").value,
      "exon_number": document.getElementById("input-5-prime-ex").value,
      "gene": {
        "symbol": document.getElementById("input-5-prime-gene").value
      },
      "genomic_coordinate": {
        "chr": document.getElementById("input-5-prime-chr").value,
        "pos": document.getElementById("input-5-prime-pos").value,
      }
    };
    let junct_3_prime_end = {
      "transcript": document.getElementById("input-3-prime-tr").value,
      "exon_number": document.getElementById("input-3-prime-ex").value,
      "gene": {
        "symbol": document.getElementById("input-3-prime-gene").value
      },
      "genomic_coordinate": {
        "chr": document.getElementById("input-3-prime-chr").value,
        "pos": document.getElementById("input-3-prime-pos").value,
      }
    };
    output.junctions = {
      "5_prime_end": junct_5_prime_end,
      "3_prime_end": junct_3_prime_end
    };

    if (document.getElementById("select-causative").value == "yes") {
      let causative_event = {
        "event_type": document.getElementById("select-event-type").value,
        "structural_variation": document.getElementById("input-sv").value
      };
      output.causative_event = causative_event;
    }
    // record regulatory element type/associated genes

  } else {
    // do stuff
  }

  // POST JSON at submission endpoint
  let request = new XMLHttpRequest();
  request.open("POST", "/submit");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(output));
  request.onload = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      window.location.reload()
    }
    // do something? handle error here etc
  };
  console.log('here');
}

/* add event listeners */
document.getElementById("select-chimeric").onchange = (event) => handleYesNoEvent("protein-coding", "rearrange")(event);
document.getElementById("select-rearrange").onchange = handleRearrange;
document.getElementById(
  "select-protein-coding"
).onchange = handleSelectProteinCoding;
document.getElementById(
  "select-rf-preserved"
).onchange = handleReadFramePreserved;
document.getElementById("select-causative").onchange = handleCausativeEvent;
document.getElementById("select-also-rearrange").onchange = handleAlsoRearrange;
document.getElementById("submit-button").onclick = handleSubmit;