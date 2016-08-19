<?php

function getNextID($arr) {
    $id = 1;

    foreach ($arr as $key => $item) {
        switch (gettype($item)) {
            case 'object':
                $itemID = intval($item->id);
                break;
            default:
                $itemID = intval($item['id']);
                break;
        }
        
        if ($itemID > $id) {
            $id = $itemID;
        }
    }
    return ($id + 1);
}

function updateJSONFile($file, $data) {
    $data = json_encode($data);
    file_put_contents($file, $data);
}
function getJSONArray($book) {
    $t = '[';
    foreach ($book as $entry) {
        if ($t !== '[') {
            $t .= ',';
        }
        $t .= json_encode($entry);
    }
    $t .= ']';
    return $t;
}

$file = "js/book.json";
$json = json_decode(file_get_contents($file));
$bookArray = json_decode(file_get_contents($file), true);

// remove function
if (isset($_GET['rem']) && $_GET['rem']) {
    $entry = json_decode($_GET['rem']);
    
    foreach ($bookArray as $key => $person) {
        if ($person['id'] == $entry->id){
            unset($bookArray[$key]);
        }
    }

    updateJSONFile($file, $bookArray);
}

// insert / update
if (isset($_GET['items']) && $_GET['items']) {
    // decode the items string to array
    $items = json_decode($_GET['items']);

    // iterate over the new/update items
    foreach($items as $key => $item) {
        // search for the id and switch for handling
        unset($item->update);
        
        switch (strtolower($item->id)) {
            case 'new':
                // get next ID
                $item->id = (String)getNextID($bookArray);
                $bookArray[] = $item;
                break;
            default:
                // update item
                foreach($bookArray as $key => $person) {
                    switch (gettype($person)) {
                        case 'object':
                            $personID = intval($person->id);
                            break;
                        default:
                            $personID = intval($person['id']);
                            break;
                    }
                    switch (gettype($item)) {
                        case 'object':
                            $itemID = intval($item->id);
                            break;
                        default:
                            $itemID = intval($item['id']);
                            break;
                    }
                    
                    if ($personID == $itemID) {

                        $bookArray[$key] = $item;
                    }
                }
                break;
        }
    }
    updateJSONFile($file, $bookArray);
    
}
echo getJSONArray($bookArray);
?>