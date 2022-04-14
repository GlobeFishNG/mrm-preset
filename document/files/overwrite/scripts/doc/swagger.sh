#!/bin/bash

declare -a files
function read_dir() {
  local dir=$1
  local ext=$2
  local top=$3
  if [ "$top" = "yes" ]
  then
    files=()
  fi
  for file in `ls $1`
  do
    local path=$1"/"$file
    if [ -d $path ]
    then
      read_dir $path $ext no
    else
      if [ "$ext" = "${file##*.}" ]
      then
        files=($path ${files[@]})
      fi
    fi
  done
}

read_dir docs/api yml yes

for yaml_file in ${files[@]}
do
  in_file=$yaml_file
  out_file=${in_file%%.*}.html
  redoc-cli build $in_file -o $out_file
done
